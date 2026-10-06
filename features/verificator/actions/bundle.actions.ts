'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ApplicationStatus, ApplicationType, AuditAction, UserRole } from '@prisma/client';
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

export async function getAvailableBundles(applicationType?: ApplicationType): Promise<ActionResponse<any[]>> {
    try {
        const whereClause: any = {};
        if (applicationType) {
            whereClause.OR = [
                { applicationType },
                { applicationType: null },
            ];
        }

        const bundles = await prisma.bundle.findMany({
            where: whereClause,
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

export async function getUnbundledApplications(
    applicationType?: ApplicationType
): Promise<ActionResponse<any[]>> {
    try {
        const whereClause: any = {
            OR: [
                { bundleId: null },
                { bundleId: { isSet: false } },
            ],
            status: ApplicationStatus.VERIFYING,
        };

        if (applicationType) {
            whereClause.applicationType = applicationType;
        }

        const apps = await prisma.application.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                applicationId: true,
                applicationType: true,
                requestedNop: true,
                status: true,
                createdAt: true,
                taxSubject: true,
                taxObject: true,
            },
        });

        return {
            success: true,
            data: apps,
        };
    } catch (error) {
        console.error('Error fetching unbundled applications:', error);
        return {
            success: false,
            message: 'Gagal memuat permohonan tanpa bundle.',
            data: [],
        };
    }
}

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
                        applicationType: true,
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

        if (validData.applicationIds && validData.applicationIds.length > 0) {
            const apps = await prisma.application.findMany({
                where: { id: { in: validData.applicationIds } },
                select: { id: true, applicationType: true, bundleId: true, applicationId: true },
            });

            const alreadyBundled = apps.filter((a) => a.bundleId);
            if (alreadyBundled.length > 0) {
                return {
                    success: false,
                    message: `Permohonan #${alreadyBundled[0].applicationId} sudah masuk ke bundle lain.`,
                };
            }

            const mismatched = apps.filter((a) => a.applicationType !== validData.applicationType);
            if (mismatched.length > 0) {
                return {
                    success: false,
                    message: 'Semua permohonan dalam 1 bundle harus memiliki jenis permohonan yang sama.',
                };
            }
        }

        const newBundle = await prisma.bundle.create({
            data: {
                bundleId: finalBundleId,
                applicationType: validData.applicationType,
                createdById: session.user.id,
            },
        });

        if (validData.applicationIds && validData.applicationIds.length > 0) {
            for (const appId of validData.applicationIds) {
                const app = await prisma.application.findUnique({ where: { id: appId } });
                if (app) {
                    const newStatus = ApplicationStatus.VERIFYING;

                    const updateResult = await prisma.application.updateMany({
                        where: {
                            id: appId,
                            OR: [
                                { bundleId: null },
                                { bundleId: { isSet: false } },
                            ],
                        },
                        data: {
                            bundleId: newBundle.id,
                            verificatorId: session.user.id,
                            status: newStatus,
                        },
                    });

                    if (updateResult.count > 0) {
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
                                    applicationType: newBundle.applicationType,
                                },
                            },
                        });
                    }
                }
            }
        }

        revalidatePath('/dashboard/workflow/verification');
        revalidatePath('/dashboard/workflow/verification/manage-bundle');
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

export async function assignApplicationsToBundle(
    applicationIds: string[],
    bundleId: string
): Promise<ActionResponse<{ bundleId: string; count: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        if (!applicationIds || applicationIds.length === 0) {
            return {
                success: false,
                message: 'Pilih minimal satu permohonan.',
            };
        }

        const bundle = await prisma.bundle.findUnique({
            where: { id: bundleId },
            include: {
                applications: {
                    select: { id: true, applicationType: true },
                    take: 1,
                },
            },
        });

        if (!bundle) {
            return {
                success: false,
                message: 'Data bundle tidak ditemukan.',
            };
        }

        const apps = await prisma.application.findMany({
            where: { id: { in: applicationIds } },
            select: { id: true, applicationId: true, applicationType: true, status: true, bundleId: true },
        });

        if (apps.length === 0) {
            return {
                success: false,
                message: 'Permohonan tidak ditemukan.',
            };
        }

        if (bundle.applicationType) {
            const mismatched = apps.filter((a) => a.applicationType !== bundle.applicationType);
            if (mismatched.length > 0) {
                return {
                    success: false,
                    message: 'Jenis permohonan tidak cocok dengan Bundle ini.',
                };
            }
        }

        if (bundle.applications.length > 0) {
            const existingType = bundle.applications[0].applicationType;
            const mismatched = apps.filter((a) => a.applicationType !== existingType);
            if (mismatched.length > 0) {
                return {
                    success: false,
                    message: 'Bundle ini sudah berisi permohonan dengan jenis yang berbeda.',
                };
            }
        }

        if (!bundle.applicationType && apps.length > 0) {
            await prisma.bundle.update({
                where: { id: bundle.id },
                data: { applicationType: apps[0].applicationType },
            });
        }

        let assignedCount = 0;
        for (const app of apps) {
            if (app.bundleId) continue;

            const newStatus = ApplicationStatus.VERIFYING;

            const updateResult = await prisma.application.updateMany({
                where: {
                    id: app.id,
                    OR: [
                        { bundleId: null },
                        { bundleId: { isSet: false } },
                    ],
                },
                data: {
                    bundleId: bundle.id,
                    verificatorId: session.user.id,
                    status: newStatus,
                },
            });

            if (updateResult.count > 0) {
                assignedCount++;
                await prisma.auditLog.create({
                    data: {
                        applicationId: app.id,
                        actorId: session.user.id,
                        actorName: session.user.name,
                        actorRole: session.user.role as UserRole,
                        action: AuditAction.ASSIGN_BUNDLE,
                        previousStatus: app.status,
                        newStatus: newStatus,
                        metadata: {
                            bundleId: bundle.id,
                            bundleCode: bundle.bundleId,
                            applicationType: bundle.applicationType || app.applicationType,
                        },
                    },
                });
            }
        }

        revalidatePath('/dashboard/workflow/verification');
        revalidatePath('/dashboard/workflow/verification/manage-bundle');
        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/bundles');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `${assignedCount} permohonan berhasil dimasukkan ke Bundle ${bundle.bundleId}.`,
            data: {
                bundleId: bundle.bundleId,
                count: assignedCount,
            },
        };
    } catch (error) {
        console.error('Error assigning applications to bundle:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat memasukkan permohonan ke dalam bundle.',
        };
    }
}

export async function addApplicationToBundle(
    applicationId: string,
    bundleId: string
): Promise<ActionResponse<{ id: string; bundleId: string }>> {
    const res = await assignApplicationsToBundle([applicationId], bundleId);
    if (res.success && res.data) {
        return {
            success: true,
            message: res.message,
            data: {
                id: applicationId,
                bundleId: res.data.bundleId,
            },
        };
    }
    return {
        success: false,
        message: res.message || 'Gagal memasukkan permohonan ke dalam bundle.',
    };
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

        const updateResult = await prisma.application.updateMany({
            where: {
                id: applicationId,
                bundleId: previousBundleId,
            },
            data: {
                bundleId: null,
            },
        });

        if (updateResult.count === 0) {
            return {
                success: false,
                message: 'Permohonan ini sudah tidak berada di dalam bundle yang dipilih.',
            };
        }

        if (previousBundleId) {
            const remainingCount = await prisma.application.count({
                where: { bundleId: previousBundleId },
            });
            if (remainingCount === 0) {
                await prisma.bundle.update({
                    where: { id: previousBundleId },
                    data: { applicationType: null },
                });
            }
        }

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

        revalidatePath('/dashboard/workflow/verification');
        revalidatePath('/dashboard/workflow/verification/manage-bundle');
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

/**
 * Server Action: Mengklaim permohonan secara mandiri oleh Verifikator
 */
export async function claimApplication(
    applicationId: string
): Promise<ActionResponse<{ id: string; status: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.VERIFICATOR];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Hanya Verifikator yang dapat mengklaim permohonan.',
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

        const updateResult = await prisma.application.updateMany({
            where: {
                id: applicationId,
                verificatorId: null,
            },
            data: {
                verificatorId: session.user.id,
                status: ApplicationStatus.VERIFYING,
            },
        });

        if (updateResult.count === 0) {
            return {
                success: false,
                message: 'Permohonan ini baru saja diklaim atau diproses oleh Verifikator lain.',
            };
        }

        const updatedApp = await prisma.application.update({
            where: { id: applicationId },
            data: {
                verificatorId: session.user.id,
                status: ApplicationStatus.VERIFYING,
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: app.id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.CLAIM,
                previousStatus: app.status,
                newStatus: ApplicationStatus.VERIFYING,
                metadata: {
                    applicationId: app.applicationId,
                    claimedBy: session.user.name,
                },
            },
        });

        revalidatePath('/dashboard/workflow/verification');
        revalidatePath('/dashboard/workflow/verification/manage-bundle');
        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/applications');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Permohonan #${app.applicationId} berhasil diklaim.`,
            data: {
                id: updatedApp.id,
                status: updatedApp.status,
            },
        };
    } catch (error) {
        console.error('Error claiming application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat mengklaim permohonan.',
        };
    }
}

export async function getBundleRecommendationData(bundleIdOrId: string): Promise<ActionResponse<any>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return {
                success: false,
                message: 'Akses ditolak. Sesi tidak valid.',
            };
        }

        const bundle = await prisma.bundle.findFirst({
            where: {
                OR: [
                    { id: bundleIdOrId },
                    { bundleId: bundleIdOrId },
                ],
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                applications: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        applicationId: true,
                        smartgovId: true,
                        requestedNop: true,
                        applicationType: true,
                        taxSubject: true,
                        taxObject: true,
                        complementary: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!bundle) {
            return {
                success: false,
                message: 'Bundle tidak ditemukan.',
            };
        }

        let counter = 1;
        const formattedApplications = bundle.applications.map((app) => {
            const prevLB = app.complementary?.[0]?.taxObjectData?.buildingArea ?? 0;
            const newLB = app.taxObject?.buildingArea ?? 0;
            const hasBuildingDiff = Number(prevLB) !== Number(newLB);

            const noBumi = counter++;
            let noBangunan: number | null = null;
            if (hasBuildingDiff) {
                noBangunan = counter++;
            }

            return {
                ...app,
                formNumbers: {
                    noBumi,
                    noBangunan,
                },
            };
        });

        return {
            success: true,
            data: {
                ...bundle,
                applications: formattedApplications,
            },
        };
    } catch (error) {
        console.error('Error fetching bundle recommendation data:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat memuat data surat rekomendasi.',
        };
    }
}


