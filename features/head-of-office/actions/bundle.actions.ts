'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { signBundleSchema } from '../schemas/bundle.schema';

export async function getKuptBundles() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const bundles = await prisma.bundle.findMany({
      where: {
        applications: {
          some: {
            status: ApplicationStatus.OFFICE_HEAD_APPROVING,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicationId: true,
            status: true,
            smartgovId: true,
            taxSubject: true,
          },
        },
      },
    });

    return { success: true, data: bundles };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat daftar bundle telaah KUPT';
    return {
      success: false,
      message,
      data: [],
    };
  }
}

export async function signByHeadOfOffice(bundleId: string) {
  try {
    const validation = signBundleSchema.safeParse({ bundleId });
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || 'Parameter ID bundle tidak valid.',
      };
    }

    const validBundleId = validation.data.bundleId;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu.',
      };
    }

    if (session.user.role !== UserRole.HEAD_OF_OFFICE) {
      return {
        success: false,
        message: 'Hanya Kepala Kantor UPT (KUPT) yang berwenang menandatangani keputusan bundle.',
      };
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: validBundleId },
      include: {
        applications: {
          where: {
            status: ApplicationStatus.OFFICE_HEAD_APPROVING,
          },
          select: {
            id: true,
            applicationId: true,
            status: true,
          },
        },
      },
    });

    if (!bundle) {
      return {
        success: false,
        message: 'Data bundle tidak ditemukan.',
      };
    }

    const eligibleApps = bundle.applications;

    if (eligibleApps.length === 0) {
      return {
        success: false,
        message: 'Tidak ada permohonan dalam bundle ini yang menunggu tanda tangan persetujuan KUPT.',
      };
    }

    const appIds = eligibleApps.map((app) => app.id);

    const auditLogs = eligibleApps.map((app) => ({
      applicationId: app.id,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: AuditAction.SIGN_OFFICE_HEAD,
      previousStatus: ApplicationStatus.OFFICE_HEAD_APPROVING,
      newStatus: ApplicationStatus.DELIVERING,
      metadata: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        forwardedTo: 'DELIVERY_OFFICER',
      },
    }));

    await prisma.$transaction([
      prisma.application.updateMany({
        where: {
          id: { in: appIds },
          status: ApplicationStatus.OFFICE_HEAD_APPROVING,
        },
        data: {
          status: ApplicationStatus.DELIVERING,
        },
      }),
      prisma.auditLog.createMany({
        data: auditLogs,
      }),
      prisma.bundle.update({
        where: { id: bundle.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    revalidatePath('/dashboard/workflow/ttd-kupt');
    revalidatePath(`/dashboard/workflow/ttd-kupt/${validBundleId}/approval`);
    revalidatePath('/dashboard/workflow/paraf-ktu');
    revalidatePath(`/dashboard/workflow/paraf-ktu/${validBundleId}/approval`);
    revalidatePath('/dashboard/workflow/verification');
    revalidatePath('/dashboard/workflow/verification/manage-bundle');
    revalidatePath('/dashboard/audit-log');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Tanda tangan KUPT untuk Bundle ${bundle.bundleId} berhasil disimpan (${eligibleApps.length} berkas siap didistribusikan/dikirim).`,
      data: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        count: eligibleApps.length,
      },
    };
  } catch (error: unknown) {
    console.error('Error signing bundle by KUPT:', error);
    const message = error instanceof Error ? error.message : 'Gagal menyimpan tanda tangan KUPT.';
    return {
      success: false,
      message,
    };
  }
}

export const signBundleByKupt = signByHeadOfOffice;
