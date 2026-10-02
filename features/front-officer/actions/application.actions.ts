'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ApplicationFormInput, applicationFormSchema } from '../schemas/application.schema';
import { ApplicationStatus, AuditAction, SubmissionChannel, UserRole } from '@prisma/client';
import { formatNopInput } from '@/lib/utils';

export type ActionResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
};

function generateUniqueApplicationId(): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    return `SIP-${dateStr}-${randomStr}`;
}

/**
 * Server Action: Membuat Permohonan Baru (Create Application)
 */
export async function createApplication(
    formData: ApplicationFormInput
): Promise<ActionResponse<{ id: string; applicationId: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk membuat permohonan.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.FRONT_OFFICER, UserRole.VERIFICATOR];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Anda tidak memiliki hak akses untuk mendaftarkan permohonan.',
            };
        }

        const validationResult = applicationFormSchema.safeParse(formData);
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            return {
                success: false,
                message: 'Validasi form gagal. Silakan periksa kembali inputan Anda.',
                errors: fieldErrors as Record<string, string[]>,
            };
        }
        const validData = validationResult.data;

        let finalAppId = validData.applicationId?.trim();
        if (!finalAppId) {
            let isUnique = false;
            while (!isUnique) {
                const candidate = generateUniqueApplicationId();
                const existing = await prisma.application.findUnique({ where: { applicationId: candidate } });
                if (!existing) {
                    finalAppId = candidate;
                    isUnique = true;
                }
            }
        } else {
            const existingApp = await prisma.application.findUnique({
                where: { applicationId: finalAppId },
            });
            if (existingApp) {
                return {
                    success: false,
                    message: `Nomor permohonan "${finalAppId}" sudah terdaftar di sistem.`,
                    errors: {
                        applicationId: ['Nomor permohonan ini sudah digunakan.'],
                    },
                };
            }
        }

        const formattedRequestedNop = validData.requestedNop ? formatNopInput(validData.requestedNop) : '';
        const formattedTaxObject = validData.taxObject
            ? {
                ...validData.taxObject,
                nop: validData.taxObject.nop ? formatNopInput(validData.taxObject.nop) : '',
            }
            : validData.taxObject;
        const formattedComplementary = (validData.complementary || []).map((item: any) => ({
            ...item,
            taxObjectData: item?.taxObjectData
                ? {
                    ...item.taxObjectData,
                    nop: item.taxObjectData.nop ? formatNopInput(item.taxObjectData.nop) : '',
                }
                : item?.taxObjectData,
        }));

        const newApp = await prisma.application.create({
            data: {
                applicationId: finalAppId,
                smartgovId: validData.smartgovId || null,
                smartgovCreatedAt: validData.smartgovCreatedAt || null,
                applicationType: validData.applicationType as any,
                requestedNop: formattedRequestedNop,
                status: ApplicationStatus.SUBMITTED,
                submissionChannel: SubmissionChannel.FRONT_OFFICER,
                frontOfficerId: session.user.id,
                taxSubject: validData.taxSubject as any,
                taxObject: formattedTaxObject as any,
                complementary: formattedComplementary as any,
                files: validData.files,
                note: validData.note || null,
                sla: {
                    totalStartedAt: new Date(),
                    totalDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    currentStageStartedAt: new Date(),
                    currentStageMinutesLimit: 2 * 24 * 60,
                },
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: newApp.id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.SUBMIT,
                newStatus: ApplicationStatus.SUBMITTED,
                metadata: {
                    applicationId: newApp.applicationId,
                    smartgovId: newApp.smartgovId,
                    applicationType: newApp.applicationType,
                },
            },
        });

        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/applications');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Permohonan berhasil disimpan!',
            data: {
                id: newApp.id,
                applicationId: newApp.applicationId,
            },
        };
    } catch (error) {
        console.error('Error creating application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat menyimpan permohonan.',
        };
    }
}

/**
 * Server Action: Memperbarui Permohonan (Edit Application)
 */
export async function editApplication(
    id: string,
    formData: ApplicationFormInput
): Promise<ActionResponse<{ id: string; applicationId: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk mengubah permohonan.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.FRONT_OFFICER, UserRole.VERIFICATOR];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Anda tidak memiliki hak akses untuk mengubah permohonan.',
            };
        }

        const existingApp = await prisma.application.findUnique({
            where: { id },
        });
        if (!existingApp) {
            return {
                success: false,
                message: 'Data permohonan tidak ditemukan.',
            };
        }

        const editableStatuses: ApplicationStatus[] = [
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.VERIFYING,
            ApplicationStatus.INTERNAL_REVISION,
            ApplicationStatus.EXTERNAL_REVISION,
        ];
        if (!editableStatuses.includes(existingApp.status)) {
            return {
                success: false,
                message: `Permohonan dengan status "${existingApp.status}" sudah tidak dapat diubah di formulir pendaftaran.`,
            };
        }

        const validationResult = applicationFormSchema.safeParse(formData);
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            return {
                success: false,
                message: 'Validasi form gagal. Silakan periksa kembali inputan Anda.',
                errors: fieldErrors as Record<string, string[]>,
            };
        }
        const validData = validationResult.data;

        const targetAppId = validData.applicationId?.trim() || existingApp.applicationId;
        if (targetAppId !== existingApp.applicationId) {
            const numberConflict = await prisma.application.findUnique({
                where: { applicationId: targetAppId },
            });
            if (numberConflict) {
                return {
                    success: false,
                    message: `Nomor permohonan "${targetAppId}" sudah digunakan oleh permohonan lain.`,
                    errors: {
                        applicationId: ['Nomor permohonan ini sudah digunakan.'],
                    },
                };
            }
        }

        const formattedRequestedNop = validData.requestedNop ? formatNopInput(validData.requestedNop) : '';
        const formattedTaxObject = validData.taxObject
            ? {
                ...validData.taxObject,
                nop: validData.taxObject.nop ? formatNopInput(validData.taxObject.nop) : '',
            }
            : validData.taxObject;
        const formattedComplementary = (validData.complementary || []).map((item: any) => ({
            ...item,
            taxObjectData: item?.taxObjectData
                ? {
                    ...item.taxObjectData,
                    nop: item.taxObjectData.nop ? formatNopInput(item.taxObjectData.nop) : '',
                }
                : item?.taxObjectData,
        }));

        const updatedApp = await prisma.application.update({
            where: { id },
            data: {
                applicationId: targetAppId,
                smartgovId: validData.smartgovId || null,
                smartgovCreatedAt: validData.smartgovCreatedAt || null,
                smartgovCompletedAt: validData.smartgovCompletedAt || null,
                applicationType: validData.applicationType as any,
                requestedNop: formattedRequestedNop,
                taxSubject: validData.taxSubject as any,
                taxObject: formattedTaxObject as any,
                complementary: formattedComplementary as any,
                files: validData.files,
                note: validData.note || null,
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: existingApp.status === ApplicationStatus.SUBMITTED ? AuditAction.EDIT : AuditAction.RESUBMIT_REVISION,
                previousStatus: existingApp.status,
                newStatus: updatedApp.status,
                metadata: {
                    applicationId: updatedApp.applicationId,
                    applicationType: updatedApp.applicationType,
                },
            },
        });

        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/applications');
        revalidatePath(`/dashboard/workflow/applications/${id}/edit`);
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Permohonan berhasil diperbarui!',
            data: {
                id: updatedApp.id,
                applicationId: updatedApp.applicationId,
            },
        };
    } catch (error) {
        console.error('Error editing application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat memperbarui permohonan.',
        };
    }
}

/**
 * Server Action: Mengambil Data Permohonan Berdasarkan ID
 */
export async function getApplicationById(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                frontOfficer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                verificator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                bundle: true,
            },
        });

        if (!application) {
            return {
                success: false,
                message: 'Permohonan tidak ditemukan.',
            };
        }

        return {
            success: true,
            data: application,
        };
    } catch (error) {
        console.error('Error fetching application by ID:', error);
        return {
            success: false,
            message: 'Gagal mengambil data permohonan.',
        };
    }
}

/**
 * Server Action: Duplikasi Permohonan (Duplicate Application)
 */
export async function duplicateApplication(
    sourceAppId: string,
    formData: ApplicationFormInput
): Promise<ActionResponse<{ id: string; applicationId: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk menduplikasi permohonan.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.FRONT_OFFICER, UserRole.VERIFICATOR];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Anda tidak memiliki hak akses untuk menduplikasi permohonan.',
            };
        }

        const validationResult = applicationFormSchema.safeParse(formData);
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            return {
                success: false,
                message: 'Validasi form gagal. Silakan periksa kembali inputan Anda.',
                errors: fieldErrors as Record<string, string[]>,
            };
        }
        const validData = validationResult.data;

        let finalAppId = generateUniqueApplicationId();
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.application.findUnique({ where: { applicationId: finalAppId } });
            if (!existing) {
                isUnique = true;
            } else {
                finalAppId = generateUniqueApplicationId();
            }
        }

        const formattedRequestedNop = validData.requestedNop ? formatNopInput(validData.requestedNop) : '';
        const formattedTaxObject = validData.taxObject
            ? {
                ...validData.taxObject,
                nop: validData.taxObject.nop ? formatNopInput(validData.taxObject.nop) : '',
            }
            : validData.taxObject;
        const formattedComplementary = (validData.complementary || []).map((item: any) => ({
            ...item,
            taxObjectData: item?.taxObjectData
                ? {
                    ...item.taxObjectData,
                    nop: item.taxObjectData.nop ? formatNopInput(item.taxObjectData.nop) : '',
                }
                : item?.taxObjectData,
        }));

        const duplicatedApp = await prisma.application.create({
            data: {
                applicationId: finalAppId,
                smartgovId: null,
                smartgovCreatedAt: null,
                smartgovCompletedAt: null,
                applicationType: validData.applicationType as any,
                requestedNop: formattedRequestedNop,
                status: ApplicationStatus.SUBMITTED,
                submissionChannel: SubmissionChannel.FRONT_OFFICER,
                frontOfficerId: session.user.id,
                taxSubject: validData.taxSubject as any,
                taxObject: formattedTaxObject as any,
                complementary: formattedComplementary as any,
                files: validData.files || [],
                note: validData.note || null,
                sla: {
                    totalStartedAt: new Date(),
                    totalDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    currentStageStartedAt: new Date(),
                    currentStageMinutesLimit: 2 * 24 * 60,
                },
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: duplicatedApp.id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: 'DUPLICATE' as AuditAction,
                newStatus: ApplicationStatus.SUBMITTED,
                metadata: {
                    applicationId: duplicatedApp.applicationId,
                    duplicatedFromSourceId: sourceAppId,
                    applicationType: duplicatedApp.applicationType,
                },
            },
        });

        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/applications');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Permohonan berhasil diduplikasi dan diajukan!',
            data: {
                id: duplicatedApp.id,
                applicationId: duplicatedApp.applicationId,
            },
        };
    } catch (error) {
        console.error('Error duplicating application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat menduplikasi permohonan.',
        };
    }
}

/**
 * Server Action: Mengubah status isFavorite pada permohonan
 */
export async function toggleApplicationFavorite(
    id: string,
    isFavorite?: boolean
): Promise<ActionResponse<{ id: string; isFavorite: boolean }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.FRONT_OFFICER];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Hanya petugas Front Officer yang dapat menandai atau memperbarui permohonan favorit.',
            };
        }

        const existingApp = await prisma.application.findUnique({
            where: { id },
            select: {
                id: true,
                applicationId: true,
                applicationType: true,
                status: true,
                isFavorite: true,
            },
        });

        if (!existingApp) {
            return {
                success: false,
                message: 'Data permohonan tidak ditemukan.',
            };
        }

        const targetFavorite = typeof isFavorite === 'boolean' ? isFavorite : !existingApp.isFavorite;

        const updatedApp = await prisma.application.update({
            where: { id },
            data: {
                isFavorite: targetFavorite,
            },
            select: {
                id: true,
                isFavorite: true,
            },
        });

        await prisma.auditLog.create({
            data: {
                applicationId: id,
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role as UserRole,
                action: AuditAction.TOGGLE_FAVORITE,
                previousStatus: existingApp.status,
                newStatus: existingApp.status,
                metadata: {
                    applicationId: existingApp.applicationId,
                    applicationType: existingApp.applicationType,
                    isFavorite: targetFavorite,
                    previousFavorite: existingApp.isFavorite,
                },
            },
        });

        revalidatePath('/dashboard/workflow/submission');
        revalidatePath('/dashboard/workflow/applications');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: targetFavorite ? 'Permohonan ditandai sebagai favorit.' : 'Permohonan dihapus dari favorit.',
            data: {
                id: updatedApp.id,
                isFavorite: updatedApp.isFavorite,
            },
        };
    } catch (error) {
        console.error('Error toggling application favorite:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat memperbarui status favorit.',
        };
    }
}

/**
 * Server Action: Mengambil data bukti penerimaan pelayanan untuk dicetak
 */
export async function getApplicationReceipt(id: string): Promise<ActionResponse<any>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu.',
            };
        }

        const application = await prisma.application.findUnique({
            where: { id },
            select: {
                id: true,
                applicationId: true,
                applicationType: true,
                status: true,
                createdAt: true,
                requestedNop: true,
                taxSubject: true,
                taxObject: true,
                sla: true,
                frontOfficer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!application) {
            return {
                success: false,
                message: 'Data permohonan tidak ditemukan.',
            };
        }

        return {
            success: true,
            data: application,
        };
    } catch (error) {
        console.error('Error fetching application receipt:', error);
        return {
            success: false,
            message: 'Gagal mengambil data bukti penerimaan pelayanan.',
        };
    }
}