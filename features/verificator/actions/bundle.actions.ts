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
    const latestBundle = await prisma.bundle.findFirst({
        where: {
            bundleId: {
                endsWith: `/${currentYear}`,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            bundleId: true,
        },
    });

    let nextNumber = 1;
    if (latestBundle?.bundleId) {
        const match = latestBundle.bundleId.match(/973\/(\d+)-/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    const paddedNum = String(nextNumber).padStart(3, '0');
    return `973/${paddedNum}-UPT.PD.WIL.IV/${currentYear}`;
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
    applicationType?: ApplicationType,
    limit: number = 100
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
            take: limit,
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

        let newBundle;
        let attempts = 0;
        while (!newBundle && attempts < 3) {
            try {
                newBundle = await prisma.bundle.create({
                    data: {
                        bundleId: finalBundleId,
                        applicationType: validData.applicationType,
                        createdById: session.user.id,
                    },
                });
            } catch (err: any) {
                if (err?.code === 'P2002' && !validData.bundleId) {
                    attempts++;
                    const match = finalBundleId.match(/973\/(\d+)-/);
                    const nextNum = (match ? parseInt(match[1], 10) : 1) + attempts;
                    finalBundleId = `973/${String(nextNum).padStart(3, '0')}-UPT.PD.WIL.IV/${new Date().getFullYear()}`;
                } else {
                    throw err;
                }
            }
        }

        if (!newBundle) {
            return {
                success: false,
                message: 'Gagal menghasilkan nomor bundle unik, silakan coba kembali.',
            };
        }

        if (validData.applicationIds && validData.applicationIds.length > 0) {
            const targetAppIds = validData.applicationIds;

            await prisma.application.updateMany({
                where: {
                    id: { in: targetAppIds },
                    OR: [
                        { bundleId: null },
                        { bundleId: { isSet: false } },
                    ],
                },
                data: {
                    bundleId: newBundle.id,
                    verificatorId: session.user.id,
                    status: ApplicationStatus.VERIFYING,
                },
            });

            const auditLogs = targetAppIds.map((appId) => ({
                applicationId: appId,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.CREATE_BUNDLE,
                previousStatus: ApplicationStatus.VERIFYING,
                newStatus: ApplicationStatus.VERIFYING,
                metadata: {
                    bundleId: newBundle.id,
                    bundleCode: newBundle.bundleId,
                    applicationType: newBundle.applicationType,
                },
            }));

            await prisma.auditLog.createMany({
                data: auditLogs,
            });
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

        const unassignedApps = apps.filter((a) => !a.bundleId);
        const unassignedAppIds = unassignedApps.map((a) => a.id);
        let assignedCount = 0;

        if (unassignedAppIds.length > 0) {
            const updateRes = await prisma.application.updateMany({
                where: {
                    id: { in: unassignedAppIds },
                    OR: [
                        { bundleId: null },
                        { bundleId: { isSet: false } },
                    ],
                },
                data: {
                    bundleId: bundle.id,
                    verificatorId: session.user.id,
                    status: ApplicationStatus.VERIFYING,
                },
            });

            assignedCount = updateRes.count;

            if (assignedCount > 0) {
                const auditLogs = unassignedApps.map((app) => ({
                    applicationId: app.id,
                    actorId: session.user.id,
                    actorName: session.user.name,
                    actorRole: session.user.role as UserRole,
                    action: AuditAction.ASSIGN_BUNDLE,
                    previousStatus: app.status,
                    newStatus: ApplicationStatus.VERIFYING,
                    metadata: {
                        bundleId: bundle.id,
                        bundleCode: bundle.bundleId,
                        applicationType: bundle.applicationType || app.applicationType,
                    },
                }));

                await prisma.auditLog.createMany({
                    data: auditLogs,
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

/**
 * Server Action: Mengajukan bundle ke Kepala Tata Usaha (KTU)
 * Mengubah status permohonan di dalam bundle dari VERIFYING ke ADMINISTRATIVE_OFFICE_HEAD_APPROVING
 */
export async function submitBundleToHeadOfAdministrativeOffice(
    bundleId: string
): Promise<ActionResponse<{ bundleId: string; bundleCode: string; count: number }>> {
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
                message: 'Hanya Verifikator yang berwenang mengajukan bundle ke KTU.',
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

        const verifyingApps = bundle.applications.filter(
            (app) => app.status === ApplicationStatus.VERIFYING
        );

        if (bundle.applications.length === 0) {
            return {
                success: false,
                message: 'Bundle ini belum memiliki permohonan untuk diajukan.',
            };
        }

        if (verifyingApps.length === 0) {
            return {
                success: false,
                message: 'Semua permohonan dalam bundle ini telah diajukan atau sudah diproses.',
            };
        }

        const appIds = verifyingApps.map((app) => app.id);

        await prisma.application.updateMany({
            where: {
                id: { in: appIds },
                status: ApplicationStatus.VERIFYING,
            },
            data: {
                status: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
            },
        });

        const auditLogs = verifyingApps.map((app) => ({
            applicationId: app.id,
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role as UserRole,
            action: AuditAction.VERIFY_APPROVE,
            previousStatus: ApplicationStatus.VERIFYING,
            newStatus: ApplicationStatus.ADMINISTRATIVE_OFFICE_HEAD_APPROVING,
            metadata: {
                bundleId: bundle.id,
                bundleCode: bundle.bundleId,
                submittedTo: 'HEAD_OF_ADMINISTRATIVE_OFFICE',
            },
        }));

        const CHUNK_SIZE = 100;
        for (let i = 0; i < auditLogs.length; i += CHUNK_SIZE) {
            const chunk = auditLogs.slice(i, i + CHUNK_SIZE);
            await prisma.auditLog.createMany({
                data: chunk,
            });
        }

        revalidatePath('/dashboard/workflow/verification');
        revalidatePath('/dashboard/workflow/verification/manage-bundle');
        revalidatePath('/dashboard/workflow/paraf-ktu');
        revalidatePath('/dashboard/workflow/bundles');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Bundle ${bundle.bundleId} berhasil diajukan ke KTU (${verifyingApps.length} berkas).`,
            data: {
                bundleId: bundle.id,
                bundleCode: bundle.bundleId,
                count: verifyingApps.length,
            },
        };
    } catch (error) {
        console.error('Error submitting bundle to Head of Administrative Office:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat mengajukan bundle ke KTU.',
        };
    }
}



