'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
    ApplicationFormInput,
    applicationFormSchema,
} from '../schemas/application.schema';
import { ApplicationStatus, AuditAction, UserRole } from '@prisma/client';

export type ActionResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
};


/**
 * Server Action: Membuat Permohonan Baru (Create Application)
 */
export async function createApplication(
    formData: ApplicationFormInput
): Promise<ActionResponse<{ id: string, applicationNumber: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk membuat permohonan.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.DATA_ENTRY];
        if (!allowedRoles.includes(session.user.role as UserRole)) {
            return {
                success: false,
                message: 'Anda tidak memiliki hak akses untuk membuat permohonan.',
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

        const existingApp = await prisma.application.findUnique({
            where: { applicationNumber: validData.applicationNumber },
        });
        if (existingApp) {
            return {
                success: false,
                message: `Nomor permohonan "${validData.applicationNumber}" sudah terdaftar di sistem.`,
                errors: {
                    applicationNumber: ['Nomor permohonan ini sudah digunakan.'],
                },
            };
        }

        const result = await prisma.$transaction(async (tx) => {
            const newApp = await tx.application.create({
                data: {
                    applicationType: validData.applicationType,
                    applicationNumber: validData.applicationNumber,
                    serviceNumberDate: validData.serviceNumberDate,
                    completionDate: validData.completionDate,
                    status: ApplicationStatus.SUBMITTED,
                    complementaryData: validData.complementaryData,
                    requestedData: validData.requestedData,
                    createdById: session.user.id,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: AuditAction.SUBMIT_DATA,
                    entityType: 'APPLICATION',
                    entityId: newApp.id,
                    actorId: session.user.id,
                    newStatus: ApplicationStatus.SUBMITTED,
                    metadata: {
                        applicationNumber: newApp.applicationNumber,
                        applicationType: newApp.applicationType,
                    },
                },
            });

            await tx.applicationSnapshot.create({
                data: {
                    applicationId: newApp.id,
                    snapshotType: 'INITIAL_SUBMISSION',
                    snapshotData: JSON.parse(JSON.stringify(newApp)),
                    actorId: session.user.id,
                    note: 'Permohonan baru berhasil dibuat.',
                },
            });
            return newApp;
        });

        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/applications');

        return {
            success: true,
            message: 'Permohonan berhasil disimpan!',
            data: {
                id: result.id,
                applicationNumber: result.applicationNumber,
            },
        };
    } catch (error) {
        console.error('Error creating application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat menyimpan permohonan.',
        };
    }
};

/**
 * Server Action: Memperbarui Permohonan (Edit Application)
 */
export async function editApplication(
    id: string,
    formData: ApplicationFormInput
): Promise<ActionResponse<{ id: string; applicationNumber: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk mengubah permohonan.',
            };
        }

        const allowedRoles: UserRole[] = [UserRole.DATA_ENTRY];
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
            ApplicationStatus.REVISION,
        ];
        if (!editableStatuses.includes(existingApp.status)) {
            return {
                success: false,
                message: `Permohonan dengan status "${existingApp.status}" sudah tidak dapat diubah.`,
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

        if (validData.applicationNumber !== existingApp.applicationNumber) {
            const numberConflict = await prisma.application.findUnique({
                where: { applicationNumber: validData.applicationNumber },
            });
            if (numberConflict) {
                return {
                    success: false,
                    message: `Nomor permohonan "${validData.applicationNumber}" sudah digunakan oleh permohonan lain.`,
                    errors: {
                        applicationNumber: ['Nomor permohonan ini sudah digunakan.'],
                    },
                };
            }
        }

        const updatedApp = await prisma.$transaction(async (tx) => {
            const updated = await tx.application.update({
                where: { id },
                data: {
                    applicationType: validData.applicationType,
                    applicationNumber: validData.applicationNumber,
                    serviceNumberDate: validData.serviceNumberDate,
                    completionDate: validData.completionDate,
                    complementaryData: validData.complementaryData,
                    requestedData: validData.requestedData,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: existingApp.status === "SUBMITTED" ? AuditAction.SUBMIT_DATA : AuditAction.REVISE_DATA,
                    entityType: 'APPLICATION',
                    entityId: id,
                    actorId: session.user.id,
                    oldStatus: existingApp.status,
                    newStatus: updated.status,
                    metadata: {
                        applicationNumber: updated.applicationNumber,
                        applicationType: updated.applicationType,
                    },
                },
            });

            await tx.applicationSnapshot.create({
                data: {
                    applicationId: id,
                    snapshotType: 'REVISION',
                    snapshotData: JSON.parse(JSON.stringify(updated)),
                    actorId: session.user.id,
                    note: `Permohonan ${existingApp.status === "SUBMITTED" ? "diperbaharui" : "direvisi"} oleh pengguna.`,
                },
            });
            return updated;
        });

        revalidatePath('/dashboard/tasks');
        revalidatePath(`/dashboard/applications/${id}`);

        return {
            success: true,
            message: 'Permohonan berhasil diperbarui!',
            data: {
                id: updatedApp.id,
                applicationNumber: updatedApp.applicationNumber,
            },
        };
    } catch (error) {
        console.error('Error editing application:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server saat memperbarui permohonan.',
        };
    }
};

/**
 * Server Action: Mengambil Data Permohonan Berdasarkan ID (untuk Initial Values Mode Edit)
 */
export async function getApplicationById(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu untuk mengubah permohonan.',
            };
        }

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                    },
                },
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