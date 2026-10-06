'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getKtuBundles() {
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
      message: error.message || 'Gagal memuat daftar bundle telaah KTU',
      data: [],
    };
  }
}

/**
 * Server Action: Memberikan paraf persetujuan KTU untuk seluruh berkas permohonan dalam bundle
 * Mengubah status permohonan dari ADMINISTRATIVE_OFFICE_HEAD_APPROVING ke OFFICE_HEAD_APPROVING
 */
export async function approveBundleByKtu(bundleId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu.',
      };
    }

    const allowedRoles: UserRole[] = [UserRole.HEAD_OF_ADMINISTRATIVE_OFFICE];
    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return {
        success: false,
        message: 'Hanya Kepala Tata Usaha (KTU) yang berwenang memberikan paraf persetujuan bundle.',
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
      (app) => app.status === ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING
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
        message: 'Semua permohonan dalam bundle ini telah diparaf KTU atau sudah diproses lebih lanjut.',
      };
    }

    const appIds = eligibleApps.map((app) => app.id);

    // Update status berkas menjadi OFFICE_HEAD_APPROVING
    await prisma.application.updateMany({
      where: {
        id: { in: appIds },
        status: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
      },
      data: {
        status: ApplicationStatus.OFFICE_HEAD_APPROVING,
      },
    });

    // Catat riwayat audit log untuk setiap berkas
    const auditLogs = eligibleApps.map((app) => ({
      applicationId: app.id,
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role as UserRole,
      action: AuditAction.PARAF_ADMINISTRATIVE_HEAD,
      previousStatus: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
      newStatus: ApplicationStatus.OFFICE_HEAD_APPROVING,
      metadata: {
        bundleId: bundle.id,
        bundleCode: bundle.bundleId,
        forwardedTo: 'HEAD_OF_OFFICE',
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

    revalidatePath('/dashboard/workflow/paraf-ktu');
    revalidatePath(`/dashboard/workflow/paraf-ktu/${bundleId}/approval`);
    revalidatePath('/dashboard/workflow/ttd-kupt');
    revalidatePath(`/dashboard/workflow/ttd-kupt/${bundleId}/approval`);
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
  } catch (error: any) {
    console.error('Error approving bundle by KTU:', error);
    return {
      success: false,
      message: error.message || 'Gagal menyimpan paraf persetujuan KTU.',
    };
  }
}

