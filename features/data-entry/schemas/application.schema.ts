import { z } from 'zod';

export const applicationTypeEnum = z.enum([
    'PARTIAL_MUTATION',
    'EXPIRED_UPDATE',
    'EXPIRED_REGULAR',
    'NEW_TAX_OBJECT',
    'CORRECTION',
    'REACTIVATION',
    'MERGER_MUTATION',
    'MERGER_AND_PARTIAL_MUTATION',
]);

export type ApplicationTypeEnum = z.infer<typeof applicationTypeEnum>;

export const APPLICATION_TYPE_LABELS: Record<ApplicationTypeEnum, { title: string; desc: string }> = {
    PARTIAL_MUTATION: {
        title: 'Mutasi Sebagian',
        desc: 'Memecah 1 NOP asal menjadi satu atau lebih NOP baru.',
    },
    EXPIRED_UPDATE: {
        title: 'Mutasi Habis Update',
        desc: 'Peralihan hak penuh atas objek pajak dengan pemutakhiran luas objek pajak.',
    },
    EXPIRED_REGULAR: {
        title: 'Mutasi Habis Reguler',
        desc: 'Peralihan hak penuh atas objek pajak tanpa pemutakhiran luas objek pajak.',
    },
    NEW_TAX_OBJECT: {
        title: 'Objek Pajak Baru',
        desc: 'Pendaftaran objek pajak baru yang belum pernah memiliki NOP.',
    },
    CORRECTION: {
        title: 'Pembetulan',
        desc: 'Koreksi data subjek atau objek yang tercantum di SPPT.',
    },
    REACTIVATION: {
        title: 'Pengaktifan',
        desc: 'Mengaktifkan kembali NOP yang statusnya non-aktif/diblokir.',
    },
    MERGER_MUTATION: {
        title: 'Mutasi Penggabungan',
        desc: 'Menggabungkan beberapa NOP sama menjadi 1 NOP tunggal.',
    },
    MERGER_AND_PARTIAL_MUTATION: {
        title: 'Mutasi Penggabungan & Pemecahan',
        desc: 'Menggabungkan beberapa NOP lalu memecahnya menjadi beberapa NOP baru.',
    },
}

export const taxSubjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: 'Nama Wajib Pajak wajib diisi' }),
    whatsappNumber: z
        .string()
        .trim()
        .min(1, { message: 'Nomor WhatsApp wajib diisi' })
        .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, {
            message: 'Format nomor WhatsApp tidak valid (contoh: 081234567890)',
        }),
    address: z
        .string()
        .trim()
        .min(1, { message: 'Alamat tempat tinggal wajib diisi' }),
    block: z.string().trim().nullable().optional(),
    neighborhoodUnit: z
        .string()
        .trim()
        .min(1, { message: 'RT wajib diisi' }),
    communityUnit: z
        .string()
        .trim()
        .min(1, { message: 'RW wajib diisi' }),
    subdistrict: z
        .string()
        .trim()
        .min(1, { message: 'Kecamatan wajib diisi' }),
    village: z
        .string()
        .trim()
        .min(1, { message: 'Kelurahan/Desa wajib diisi' }),
});

export const taxObjectSchema = z.object({
    nop: z
        .string()
        .trim()
        .regex(/^$|^[0-9]{18}$/, {
            message: 'NOP harus berupa 18 digit angka',
        })
        .nullable()
        .optional(),
    nopTemporary: z.string().trim().nullable().optional(),
    nopFinal: z.string().trim().nullable().optional(),
    address: z
        .string()
        .trim()
        .min(1, { message: 'Alamat letak objek pajak wajib diisi' }),
    block: z.string().trim().nullable().optional(),
    neighborhoodUnit: z
        .string()
        .trim()
        .min(1, { message: 'RT objek wajib diisi' }),
    communityUnit: z
        .string()
        .trim()
        .min(1, { message: 'RW objek wajib diisi' }),
    subdistrict: z
        .string()
        .trim()
        .min(1, { message: 'Kecamatan objek wajib diisi' }),
    village: z
        .string()
        .trim()
        .min(1, { message: 'Kelurahan/Desa objek wajib diisi' }),
    landArea: z.coerce
        .number({ message: 'Luas bumi wajib berupa angka' })
        .positive({ message: 'Luas bumi harus lebih dari 0 m²' }),
    buildingArea: z.coerce
        .number({ message: 'Luas bangunan wajib berupa angka' })
        .min(0, { message: 'Luas bangunan tidak boleh negatif (isi 0 jika tanah kosong)' }),
    certificate: z.string().trim().nullable().optional(),
});

export const complementaryDataSchema = z.object({
    taxSubjectData: taxSubjectSchema,
    taxObjectData: taxObjectSchema,
    isPrimary: z.boolean().default(false),
});

export const requestedDataSchema = z.object({
    idRequestedData: z.string().optional(),
    taxSubjectData: taxSubjectSchema,
    taxObjectData: taxObjectSchema,
    notes: z.string().trim().nullable().optional(),
});

export const applicationFormSchema = z
    .object({
        applicationType: applicationTypeEnum,
        applicationNumber: z
            .string()
            .trim()
            .min(3, { message: 'Nomor pelayanan/NOPEL wajib diisi (minimal 3 karakter)' }),
        serviceNumberDate: z.coerce.date({
            message: 'Tanggal pelayanan wajib diisi dengan format yang valid',
        }),
        completionDate: z.coerce.date({
            message: 'Estimasi tanggal selesai wajib diisi dengan format yang valid',
        }),
        complementaryData: z.array(complementaryDataSchema).default([]),
        requestedData: z.array(requestedDataSchema).default([]),
    })
    .superRefine((data, ctx) => {
        if (data.completionDate < data.serviceNumberDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Estimasi tanggal selesai tidak boleh mendahului tanggal pelayanan',
                path: ['completionDate'],
            });
        }
        const type = data.applicationType;
        const compLen = data.complementaryData.length;
        const reqLen = data.requestedData.length;

        if (type === 'MERGER_AND_PARTIAL_MUTATION') {
            if (reqLen < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Mutasi Penggabungan & Pemecahan wajib memiliki minimal 2 NOP pemohon/hasil pecahan',
                    path: ['requestedData'],
                });
            }
        } else if (type === 'PARTIAL_MUTATION') {
            if (reqLen < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Mutasi Sebagian wajib memiliki minimal 1 NOP pemohon/pecahan',
                    path: ['requestedData'],
                });
            }
        } else {
            if (reqLen !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Jenis permohonan ${APPLICATION_TYPE_LABELS[type].title} wajib memiliki tepat 1 NOP pemohon`,
                    path: ['requestedData'],
                });
            }
        }

        if (
            type === 'PARTIAL_MUTATION' ||
            type === 'CORRECTION' ||
            type === 'EXPIRED_UPDATE' ||
            type === 'EXPIRED_REGULAR'
        ) {

            if (compLen !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Jenis permohonan ${APPLICATION_TYPE_LABELS[type].title} wajib memiliki tepat 1 NOP asal`,
                    path: ['complementaryData'],
                });
            }
        } else if (type === 'MERGER_MUTATION' || type === 'MERGER_AND_PARTIAL_MUTATION') {

            if (compLen < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Jenis permohonan ${APPLICATION_TYPE_LABELS[type].title} memerlukan minimal 2 NOP asal yang akan digabungkan`,
                    path: ['complementaryData'],
                });
            }

            const hasPrimary = data.complementaryData.some((item) => item.isPrimary);
            if (!hasPrimary && compLen > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Salah satu NOP asal wajib ditandai sebagai NOP Utama (isPrimary)',
                    path: ['complementaryData'],
                });
            }
        } else if (type === 'NEW_TAX_OBJECT') {

        } else if (type === 'REACTIVATION') {

        }
    });

export type TaxSubjectInput = z.infer<typeof taxSubjectSchema>;
export type TaxObjectInput = z.infer<typeof taxObjectSchema>;
export type ComplementaryDataInput = z.infer<typeof complementaryDataSchema>;
export type RequestedDataInput = z.infer<typeof requestedDataSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;