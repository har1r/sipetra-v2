import { z } from 'zod';
import { optionalString, optionalNumber } from '@/lib/zod-helpers';

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
};

export const APPLICATION_TYPE_UI: Record<
    ApplicationTypeEnum,
    { code: string; title: string; desc: string; badgeStyle: string }
> = {
    PARTIAL_MUTATION: {
        code: 'MSN',
        title: 'Mutasi Sebagian',
        desc: 'Memecah 1 NOP asal menjadi satu atau lebih NOP baru.',
        badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    EXPIRED_UPDATE: {
        code: 'MHU',
        title: 'Mutasi Habis Update',
        desc: 'Peralihan hak penuh atas objek pajak dengan pemutakhiran luas objek pajak.',
        badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    EXPIRED_REGULAR: {
        code: 'MHR',
        title: 'Mutasi Habis Reguler',
        desc: 'Peralihan hak penuh atas objek pajak tanpa pemutakhiran luas objek pajak.',
        badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    NEW_TAX_OBJECT: {
        code: 'OPB',
        title: 'Objek Pajak Baru',
        desc: 'Pendaftaran objek pajak baru yang belum pernah memiliki NOP.',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    CORRECTION: {
        code: 'PBT',
        title: 'Pembetulan',
        desc: 'Koreksi data subjek atau objek yang tercantum di SPPT.',
        badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    REACTIVATION: {
        code: 'AKT',
        title: 'Pengaktifan',
        desc: 'Mengaktifkan kembali NOP yang statusnya non-aktif/diblokir.',
        badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    MERGER_MUTATION: {
        code: 'MTP',
        title: 'Mutasi Penggabungan',
        desc: 'Menggabungkan beberapa NOP sama menjadi 1 NOP tunggal.',
        badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    MERGER_AND_PARTIAL_MUTATION: {
        code: 'MPP',
        title: 'Mutasi Penggabungan & Pemecahan',
        desc: 'Menggabungkan beberapa NOP lalu memecahnya menjadi beberapa NOP baru.',
        badgeStyle: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    },
};

export const taxSubjectBaseSchema = z.object({
    name: optionalString,
    whatsappNumber: optionalString,
    address: optionalString,
    block: optionalString,
    neighborhoodUnit: optionalString,
    communityUnit: optionalString,
    subdistrict: optionalString,
    village: optionalString,
});

export const taxObjectBaseSchema = z.object({
    nop: optionalString,
    nopTemporary: optionalString,
    address: optionalString,
    block: optionalString,
    neighborhoodUnit: optionalString,
    communityUnit: optionalString,
    subdistrict: optionalString,
    village: optionalString,
    landArea: optionalNumber,
    buildingArea: optionalNumber,
    certificate: optionalString,
});

export const complementaryDataSchema = z.object({
    taxSubjectData: taxSubjectBaseSchema,
    taxObjectData: taxObjectBaseSchema,
    isPrimary: z.boolean().default(false),
});

export const digitalArchiveSchema = z.object({
    idArchive: z.string().optional(),
    urlBlob: z.string().min(1, 'URL berkas wajib diisi'),
    fileName: optionalString,
    status: z.enum(['ACTIVE', 'SUPERSEDED']).default('ACTIVE'),
});

export const requestedDataSchema = z.object({
    idRequestedData: z.string().optional(),
    taxSubjectData: taxSubjectBaseSchema,
    taxObjectData: taxObjectBaseSchema,
    notes: optionalString,
    digitalArchives: z.array(digitalArchiveSchema).default([]),
});

export const applicationFormSchema = z
    .object({
        applicationType: applicationTypeEnum,
        applicationNumber: z.string().trim().min(3, 'Nomor permohonan wajib diisi'),
        serviceNumberDate: z.coerce.date({ message: 'Tanggal permohonan wajib diisi' }),
        completionDate: z.coerce.date({ message: 'Tanggal selesai wajib diisi' }),
        complementaryData: z.array(complementaryDataSchema).default([]),
        requestedData: z.array(requestedDataSchema).default([]),
    })
    .superRefine((data, ctx) => {
        if (data.completionDate < data.serviceNumberDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Tanggal selesai tidak boleh mendahului tanggal permohonan',
                path: ['completionDate'],
            });
        }
        const type = data.applicationType;

        if (type === 'NEW_TAX_OBJECT' || type === 'REACTIVATION') {
            if (data.requestedData.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data yang dimohonkan harus berjumlah tepat 1',
                    path: ['requestedData'],
                });
            }
        } else if (type === 'PARTIAL_MUTATION') {
            if (data.complementaryData.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap harus berjumlah 1',
                    path: ['complementaryData'],
                });
            }
            if (data.requestedData.length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data yang dimohonkan harus berjumlah minimal 1',
                    path: ['requestedData'],
                });
            }
        } else if (type === 'MERGER_MUTATION') {
            if (data.complementaryData.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap harus berjumlah minimal 2',
                    path: ['complementaryData'],
                });
            }
            if (data.requestedData.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data yang dimohonkan harus berjumlah tepat 1',
                    path: ['requestedData'],
                });
            }
        } else if (type === 'MERGER_AND_PARTIAL_MUTATION') {
            if (data.complementaryData.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap harus berjumlah minimal 2',
                    path: ['complementaryData'],
                });
            }
            if (data.requestedData.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data yang dimohonkan harus berjumlah minimal 2',
                    path: ['requestedData'],
                });
            }
        } else {
            if (data.complementaryData.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap harus berjumlah 1',
                    path: ['complementaryData'],
                });
            }
            if (data.requestedData.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data yang dimohonkan harus berjumlah 1',
                    path: ['requestedData'],
                });
            }
        }

        if (type === 'MERGER_MUTATION' || type === 'MERGER_AND_PARTIAL_MUTATION') {
            const hasPrimary = data.complementaryData.some((item) => item.isPrimary);
            if (!hasPrimary && data.complementaryData.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Salah satu NOP asal wajib ditandai sebagai NOP Utama (isPrimary)',
                    path: ['complementaryData'],
                });
            }
        }

        data.requestedData.forEach((item, idx) => {
            const subject = item.taxSubjectData;
            const object = item.taxObjectData;

            if (!subject.name) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama Wajib Pajak dimohonkan wajib diisi', path: ['requestedData', idx, 'taxSubjectData', 'name'] });
            }
            if (!subject.whatsappNumber) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor WhatsApp dimohonkan wajib diisi', path: ['requestedData', idx, 'taxSubjectData', 'whatsappNumber'] });
            }
            if (!subject.address) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat Wajib Pajak dimohonkan wajib diisi', path: ['requestedData', idx, 'taxSubjectData', 'address'] });
            }
            if (!subject.subdistrict) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan dimohonkan wajib diisi', path: ['requestedData', idx, 'taxSubjectData', 'subdistrict'] });
            }
            if (!subject.village) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kelurahan/Desa dimohonkan wajib diisi', path: ['requestedData', idx, 'taxSubjectData', 'village'] });
            }

            if (!object.nopTemporary) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'NOP Temporary wajib diisi', path: ['requestedData', idx, 'taxObjectData', 'nopTemporary'] });
            }
            if (!object.address) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat Objek Pajak dimohonkan wajib diisi', path: ['requestedData', idx, 'taxObjectData', 'address'] });
            }
            if (!object.subdistrict) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan Objek Pajak dimohonkan wajib diisi', path: ['requestedData', idx, 'taxObjectData', 'subdistrict'] });
            }
            if (!object.village) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kelurahan/Desa Objek Pajak dimohonkan wajib diisi', path: ['requestedData', idx, 'taxObjectData', 'village'] });
            }
            if (object.landArea === undefined || object.landArea === null || object.landArea <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bumi wajib lebih dari 0 m²', path: ['requestedData', idx, 'taxObjectData', 'landArea'] });
            }
            if (object.buildingArea === undefined || object.buildingArea === null || object.buildingArea < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bangunan wajib diisi (isi 0 jika tanah kosong)', path: ['requestedData', idx, 'taxObjectData', 'buildingArea'] });
            }
            if (!object.certificate) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor Sertifikat dimohonkan wajib diisi', path: ['requestedData', idx, 'taxObjectData', 'certificate'] });
            }

            if (type === 'CORRECTION') {
                if (!subject.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Subjek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxSubjectData', 'block'] });
                if (!subject.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Subjek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxSubjectData', 'neighborhoodUnit'] });
                if (!subject.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Subjek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxSubjectData', 'communityUnit'] });

                if (!object.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Objek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxObjectData', 'block'] });
                if (!object.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Objek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxObjectData', 'neighborhoodUnit'] });
                if (!object.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Objek wajib diisi untuk Pembetulan', path: ['requestedData', idx, 'taxObjectData', 'communityUnit'] });
            }
        });

        data.complementaryData.forEach((item, idx) => {
            const subject = item.taxSubjectData;
            const object = item.taxObjectData;

            if (type !== 'NEW_TAX_OBJECT' && type !== 'REACTIVATION') {
                if (!subject.name) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama Wajib Pajak asal wajib diisi', path: ['complementaryData', idx, 'taxSubjectData', 'name'] });
                }
                if (!object.nop) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'NOP asal wajib diisi (18 digit)', path: ['complementaryData', idx, 'taxObjectData', 'nop'] });
                }
                if (object.landArea === undefined || object.landArea === null || object.landArea <= 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bumi asal wajib diisi', path: ['complementaryData', idx, 'taxObjectData', 'landArea'] });
                }
                if (object.buildingArea === undefined || object.buildingArea === null || object.buildingArea < 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bangunan asal wajib diisi (isi 0 jika tanah kosong)', path: ['complementaryData', idx, 'taxObjectData', 'buildingArea'] });
                }
            }

            if (type === 'CORRECTION') {
                if (!subject.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat Wajib Pajak asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'address'] });
                if (!subject.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Subjek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'block'] });
                if (!subject.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Subjek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'neighborhoodUnit'] });
                if (!subject.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Subjek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'communityUnit'] });
                if (!subject.subdistrict) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan Subjek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'subdistrict'] });
                if (!subject.village) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Desa/Kelurahan Subjek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxSubjectData', 'village'] });

                if (!object.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'address'] });
                if (!object.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'block'] });
                if (!object.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'neighborhoodUnit'] });
                if (!object.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'communityUnit'] });
                if (!object.subdistrict) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'subdistrict'] });
                if (!object.village) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Desa/Kelurahan Objek asal wajib diisi untuk Pembetulan', path: ['complementaryData', idx, 'taxObjectData', 'village'] });
            }
        });
    });

export type TaxSubjectInput = z.infer<typeof taxSubjectBaseSchema>;
export type TaxObjectInput = z.infer<typeof taxObjectBaseSchema>;
export type ComplementaryDataInput = z.infer<typeof complementaryDataSchema>;
export type DigitalArchiveInput = z.infer<typeof digitalArchiveSchema>;
export type RequestedDataInput = z.infer<typeof requestedDataSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
