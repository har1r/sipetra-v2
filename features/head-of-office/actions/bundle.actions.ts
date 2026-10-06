'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getKuptBundles() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const bundles = await prisma.bundle.findMany({
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
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat daftar bundle telaah KUPT',
      data: [],
    };
  }
}

/**
 * Server Action: Memberikan tanda tangan persetujuan KUPT untuk seluruh berkas permohonan dalam bundle
 * Mengubah status permohonan dari OFFICE_HEAD_APPROVING ke DELIVERING
 */
export async function signBundleByKupt(bundleId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu.',
      };
    }

    const allowedRoles: UserRole[] = [UserRole.HEAD_OF_OFFICE];
    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return {
        success: false,
        message: 'Hanya Kepala Kantor UPT (KUPT) yang berwenang menandatangani keputusan bundle.',
      };
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        applications: {
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

    const eligibleApps = bundle.applications.filter(
      (app) => app.status === ApplicationStatus.OFFICE_HEAD_APPROVING
    );

    if (bundle.applications.length === 0) {
      return {
        success: false,
        message: 'Bundle ini tidak memiliki berkas permohonan.',
      };
    }

    if (eligibleApps.length === 0) {
      return {
        success: false,
        message: 'Semua permohonan dalam bundle ini telah ditandatangani KUPT atau sudah diproses lebih lanjut.',
      };
    }

    const appIds = eligibleApps.map((app) => app.id);

    // Update status berkas menjadi DELIVERING
    await prisma.application.updateMany({
      where: {
        id: { in: appIds },
        status: ApplicationStatus.OFFICE_HEAD_APPROVING,
      },
      data: {
        status: ApplicationStatus.DELIVERING,
      },
    });

    // Catat riwayat audit log untuk setiap berkas
    const auditLogs = eligibleApps.map((app) => ({
      applicationId: app.id,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role as UserRole,
      action: AuditAction.SIGN_OFFICE_HEAD,
      previousStatus: ApplicationStatus.OFFICE_HEAD_APPROVING,
      newStatus: ApplicationStatus.DELIVERING,
      metadata: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        forwardedTo: 'DELIVERY_OFFICER',
      },
    }));

    await prisma.auditLog.createMany({
      data: auditLogs,
    });

    // Update updatedAt pada bundle
    await prisma.bundle.update({
      where: { id: bundle.id },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/dashboard/workflow/ttd-kupt');
    revalidatePath(`/dashboard/workflow/ttd-kupt/${bundleId}/approval`);
    revalidatePath('/dashboard/workflow/paraf-ktu');
    revalidatePath(`/dashboard/workflow/paraf-ktu/${bundleId}/approval`);
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
  } catch (error: any) {
    console.error('Error signing bundle by KUPT:', error);
    return {
      success: false,
      message: error.message || 'Gagal menyimpan tanda tangan KUPT.',
    };
  }
}

