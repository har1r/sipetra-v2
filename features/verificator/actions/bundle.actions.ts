'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';
import { BundleCreateInput, bundleCreateSchema } from '../schemas/bundle.schema';

export type ActionResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
};

async function generateUniqueBundleCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await prisma.bundle.count({
        where: {
            bundleId: {
                endsWith: `/${currentYear}`,
            },
        },
    });

    let nextNumber = count + 1;
    let isUnique = false;
    let candidate = '';

    while (!isUnique) {
        const paddedNum = String(nextNumber).padStart(3, '0');
        candidate = `973/${paddedNum}-UPT.PD.WIL.IV/${currentYear}`;
        const existing = await prisma.bundle.findUnique({ where: { bundleId: candidate } });
        if (!existing) {
            isUnique = true;
        } else {
            nextNumber++;
        }
    }

    return candidate;
}

/**
 * Server Action: Mengambil seluruh bundle yang tersedia beserta jumlah permohonan
 */
export async function getAvailableBundles(): Promise<ActionResponse<any[]>> {
    try {
        const bundles = await prisma.bundle.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                _count: {
                    select: { applications: true },
                },
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: bundles,
        };
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return {
            success: false,
            message: 'Gagal memuat daftar bundle.',
            data: [],
        };
    }
}

/**
 * Server Action: Mengambil data permohonan untuk ruang kerja Verifikasi
 */
export async function getApplicationsForVerification(): Promise<any[]> {
    try {
        const applications = await prisma.application.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                bundle: {
                    select: {
                        id: true,
                        bundleId: true,
                        name: true,
                        note: true,
                    },
                },
                frontOfficer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return applications;
    } catch (error) {
        console.error('Error fetching applications for verification:', error);
        return [];
    }
}

/**
 * Server Action: Membuat bundle baru
 */
export async function createBundle(
    formData: BundleCreateInput
): Promise<ActionResponse<{ id: string; bundleId: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const parseResult = bundleCreateSchema.safeParse(formData);
        if (!parseResult.success) {
            return {
                success: false,
                message: 'Validasi data bundle gagal.',
                errors: parseResult.error.flatten().fieldErrors as Record<string, string[]>,
            };
        }

        const validData = parseResult.data;

        let finalBundleId = validData.bundleId?.trim();
        if (!finalBundleId) {
            finalBundleId = await generateUniqueBundleCode();
        } else {
            const existing = await prisma.bundle.findUnique({ where: { bundleId: finalBundleId } });
            if (existing) {
                return {
                    success: false,
                    message: 'Nomor Bundle sudah digunakan.',
                    errors: { bundleId: ['Nomor bundle sudah terdaftar di sistem.'] },
                };
            }
        }

        const newBundle = await prisma.bundle.create({
            data: {
                bundleId: finalBundleId,
                name: validData.name || null,
                note: validData.note || null,
                createdById: session.user.id,
            },
        });

        // Jika ada permohonan yang langsung dimasukkan ke bundle saat dibuat
        if (validData.applicationIds && validData.applicationIds.length > 0) {
            for (const appId of validData.applicationIds) {
                const app = await prisma.application.findUnique({ where: { id: appId } });
                if (app) {
                    const newStatus = app.status === ApplicationStatus.SUBMITTED
                        ? ApplicationStatus.VERIFYING
                        : app.status;

                    await prisma.application.update({
                        where: { id: appId },
                        data: {
                            bundleId: newBundle.id,
                            verificatorId: session.user.id,
                            status: newStatus,
                        },
                    });

                    await prisma.auditLog.create({
                        data: {
                            applicationId: appId,
                            actorId: session.user.id,
                            actorName: session.user.name,
                            actorRole: session.user.role as UserRole,
                            action: AuditAction.CREATE_BUNDLE,
                            previousStatus: app.status,
                            newStatus: newStatus,
                            metadata: {
                                bundleId: newBundle.id,
                                bundleCode: newBundle.bundleId,
                                bundleName: newBundle.name,
                            },
                        },
                    });
                }
            }
        }

        revalidatePath('/dashboard/workflow/verifikasi');
        revalidatePath('/dashboard/workflow/bundles');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Bundle ${newBundle.bundleId} berhasil dibuat!`,
            data: {
                id: newBundle.id,
                bundleId: newBundle.bundleId,
            },
        };
    } catch (error) {
        console.error('Error creating bundle:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat membuat bundle.',
        };
    }
}

/**
 * Server Action: Memasukkan permohonan ke dalam bundle (Assign to Bundle)
 */
export async function addApplicationToBundle(
    applicationId: string,
    bundleId: string
): Promise<ActionResponse<{ id: string; bundleId: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const app = await prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!app) {
            return {
                success: false,
                message: 'Data permohonan tidak ditemukan.',
            };
        }

        const bundle = await prisma.bundle.findUnique({
            where: { id: bundleId },
        });

        if (!bundle) {
            return {
                success: false,
                message: 'Data bundle tidak ditemukan.',
            };
        }

        const newStatus = app.status === ApplicationStatus.SUBMITTED
            ? ApplicationStatus.VERIFYING
            : app.status;

        const updatedApp = await prisma.application.update({
            where: { id: applicationId },
            data: {
                bundleId: bundle.id,
                verificatorId: session.user.id,
                status: newStatus,
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: app.id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.ASSIGN_BUNDLE,
                previousStatus: app.status,
                newStatus: updatedApp.status,
                metadata: {
                    bundleId: bundle.id,
                    bundleCode: bundle.bundleId,
                    bundleName: bundle.name,
                },
            },
        });

        revalidatePath('/dashboard/workflow/verifikasi');
        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/bundles');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Permohonan #${app.applicationId} berhasil dimasukkan ke Bundle ${bundle.bundleId}.`,
            data: {
                id: app.id,
                bundleId: bundle.id,
            },
        };
    } catch (error) {
        console.error('Error adding application to bundle:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat memasukkan permohonan ke dalam bundle.',
        };
    }
}

/**
 * Server Action: Mengeluarkan permohonan dari bundle (Remove from Bundle)
 */
export async function removeApplicationFromBundle(
    applicationId: string
): Promise<ActionResponse<{ id: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { bundle: true },
        });

        if (!app) {
            return {
                success: false,
                message: 'Data permohonan tidak ditemukan.',
            };
        }

        const previousBundleCode = app.bundle?.bundleId || '-';
        const previousBundleId = app.bundleId;

        await prisma.application.update({
            where: { id: applicationId },
            data: {
                bundleId: null,
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: app.id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.REMOVE_FROM_BUNDLE,
                previousStatus: app.status,
                newStatus: app.status,
                metadata: {
                    removedFromBundleId: previousBundleId,
                    removedFromBundleCode: previousBundleCode,
                },
            },
        });

        revalidatePath('/dashboard/workflow/verifikasi');
        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/bundles');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Permohonan #${app.applicationId} berhasil dikeluarkan dari Bundle ${previousBundleCode}.`,
            data: {
                id: app.id,
            },
        };
    } catch (error) {
        console.error('Error removing application from bundle:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat mengeluarkan permohonan dari bundle.',
        };
    }
}
