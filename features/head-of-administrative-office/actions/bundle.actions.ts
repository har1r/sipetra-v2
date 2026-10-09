'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { approveBundleSchema } from '../schemas/bundle.schema';

export async function getKtuBundles() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const bundles = await prisma.bundle.findMany({
      where: {
        applications: {
          some: {
            status: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
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
    const message = error instanceof Error ? error.message : 'Gagal memuat daftar bundle telaah KTU';
    return {
      success: false,
      message,
      data: [],
    };
  }
}

export async function approveByheadOfAdministrativeOfficer(bundleId: string) {
  try {
    const validation = approveBundleSchema.safeParse({ bundleId });
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

    if (session.user.role !== UserRole.HEAD_OF_ADMINISTRATIVE_OFFICE) {
      return {
        success: false,
        message: 'Hanya Kepala Tata Usaha (KTU) yang berwenang memberikan paraf persetujuan bundle.',
      };
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: validBundleId },
      include: {
        applications: {
          where: {
            status: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
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
        message: 'Tidak ada permohonan dalam bundle ini yang menunggu paraf persetujuan KTU.',
      };
    }

    const appIds = eligibleApps.map((app) => app.id);

    const auditLogs = eligibleApps.map((app) => ({
      applicationId: app.id,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: AuditAction.PARAF_ADMINISTRATIVE_HEAD,
      previousStatus: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
      newStatus: ApplicationStatus.OFFICE_HEAD_APPROVING,
      metadata: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        forwardedTo: 'HEAD_OF_OFFICE',
      },
    }));

    await prisma.$transaction([
      prisma.application.updateMany({
        where: {
          id: { in: appIds },
          status: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
        },
        data: {
          status: ApplicationStatus.OFFICE_HEAD_APPROVING,
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

    revalidatePath('/dashboard/workflow/paraf-ktu');
    revalidatePath(`/dashboard/workflow/paraf-ktu/${validBundleId}/approval`);
    revalidatePath('/dashboard/workflow/ttd-kupt');
    revalidatePath(`/dashboard/workflow/ttd-kupt/${validBundleId}/approval`);
    revalidatePath('/dashboard/workflow/verification');
    revalidatePath('/dashboard/workflow/verification/manage-bundle');
    revalidatePath('/dashboard/audit-log');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Paraf persetujuan KTU untuk Bundle ${bundle.bundleId} berhasil disimpan (${eligibleApps.length} berkas diteruskan ke KUPT).`,
      data: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        count: eligibleApps.length,
      },
    };
  } catch (error: unknown) {
    console.error('Error approving bundle by KTU:', error);
    const message = error instanceof Error ? error.message : 'Gagal menyimpan paraf persetujuan KTU.';
    return {
      success: false,
      message,
    };
  }
}

export const approveBundleByKtu = approveByheadOfAdministrativeOfficer;
