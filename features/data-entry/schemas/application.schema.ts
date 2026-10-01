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

export const taxSubjectSchema = z.object({
    name: optionalString,
    whatsappNumber: optionalString,
    address: optionalString,
    block: optionalString,
    neighborhoodUnit: optionalString,
    communityUnit: optionalString,
    subdistrict: optionalString,
    village: optionalString,
});

export const taxObjectSchema = z.object({
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
    taxSubjectData: taxSubjectSchema,
    taxObjectData: taxObjectSchema,
});

export const applicationCreateSchema = z
    .object({
        applicationId: z.string().trim().min(3, 'Nomor permohonan wajib diisi (minimal 3 karakter)'),
        smartgovId: z.string().trim().min(3, 'Nomor pelayanan SmartGov wajib diisi'),
        smartgovCreatedAt: z.coerce.date({ message: 'Tanggal pendaftaran SmartGov wajib diisi' }),
        applicationType: applicationTypeEnum,
        complementary: z.array(complementaryDataSchema).default([]),
        taxSubject: taxSubjectSchema,
        taxObject: taxObjectSchema,
        files: z.array(z.string()).default([]),
        note: optionalString,
    })
    .superRefine((data, ctx) => {
        const type = data.applicationType;

        // 1. Validasi Kardinalitas Complementary (Data Asal)
        if (type === 'NEW_TAX_OBJECT' || type === 'REACTIVATION') {
            // Data pelengkap opsional
        } else if (type === 'MERGER_MUTATION' || type === 'MERGER_AND_PARTIAL_MUTATION') {
            if (data.complementary.length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap (NOP asal) harus berjumlah minimal 2 untuk mutasi penggabungan',
                    path: ['complementary'],
                });
            }
        } else {
            // PARTIAL_MUTATION, EXPIRED_UPDATE, EXPIRED_REGULAR, CORRECTION
            if (data.complementary.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data pelengkap (NOP asal) harus berjumlah tepat 1',
                    path: ['complementary'],
                });
            }
        }

        // 2. Validasi Field TaxSubject (Wajib Pajak Pemohon)
        const subject = data.taxSubject;
        if (!subject.name) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama Wajib Pajak pemohon wajib diisi', path: ['taxSubject', 'name'] });
        }
        if (!subject.whatsappNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor WhatsApp pemohon wajib diisi', path: ['taxSubject', 'whatsappNumber'] });
        }
        if (!subject.address) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat pemohon wajib diisi', path: ['taxSubject', 'address'] });
        }
        if (!subject.subdistrict) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan pemohon wajib diisi', path: ['taxSubject', 'subdistrict'] });
        }
        if (!subject.village) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kelurahan/Desa pemohon wajib diisi', path: ['taxSubject', 'village'] });
        }

        // 3. Validasi Field TaxObject (Objek Pajak Dimohonkan)
        const object = data.taxObject;
        if (!object.nopTemporary) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'NOP Temporary wajib diisi', path: ['taxObject', 'nopTemporary'] });
        }
        if (!object.address) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat objek pajak wajib diisi', path: ['taxObject', 'address'] });
        }
        if (!object.subdistrict) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan objek pajak wajib diisi', path: ['taxObject', 'subdistrict'] });
        }
        if (!object.village) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kelurahan/Desa objek pajak wajib diisi', path: ['taxObject', 'village'] });
        }
        if (object.landArea === undefined || object.landArea === null || object.landArea <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bumi wajib lebih dari 0 m²', path: ['taxObject', 'landArea'] });
        }
        if (object.buildingArea === undefined || object.buildingArea === null || object.buildingArea < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bangunan wajib diisi (isi 0 jika tanah kosong)', path: ['taxObject', 'buildingArea'] });
        }
        if (!object.certificate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nomor Sertifikat/Keterangan Tanah wajib diisi', path: ['taxObject', 'certificate'] });
        }

        // 4. Validasi Khusus CORRECTION
        if (type === 'CORRECTION') {
            if (!subject.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Subjek wajib diisi untuk Pembetulan', path: ['taxSubject', 'block'] });
            if (!subject.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Subjek wajib diisi untuk Pembetulan', path: ['taxSubject', 'neighborhoodUnit'] });
            if (!subject.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Subjek wajib diisi untuk Pembetulan', path: ['taxSubject', 'communityUnit'] });

            if (!object.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok Objek wajib diisi untuk Pembetulan', path: ['taxObject', 'block'] });
            if (!object.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT Objek wajib diisi untuk Pembetulan', path: ['taxObject', 'neighborhoodUnit'] });
            if (!object.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW Objek wajib diisi untuk Pembetulan', path: ['taxObject', 'communityUnit'] });
        }

        // 5. Validasi Elemen ComplementaryData (Data Asal)
        data.complementary.forEach((item, idx) => {
            const cSubject = item.taxSubjectData;
            const cObject = item.taxObjectData;

            if (type !== 'NEW_TAX_OBJECT' && type !== 'REACTIVATION') {
                if (!cSubject.name) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama Wajib Pajak asal wajib diisi', path: ['complementary', idx, 'taxSubjectData', 'name'] });
                }
                if (!cObject.nop) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'NOP asal wajib diisi (18 digit)', path: ['complementary', idx, 'taxObjectData', 'nop'] });
                }
                if (cObject.landArea === undefined || cObject.landArea === null || cObject.landArea <= 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bumi asal wajib diisi', path: ['complementary', idx, 'taxObjectData', 'landArea'] });
                }
                if (cObject.buildingArea === undefined || cObject.buildingArea === null || cObject.buildingArea < 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Luas bangunan asal wajib diisi (isi 0 jika tanah kosong)', path: ['complementary', idx, 'taxObjectData', 'buildingArea'] });
                }
            }

            if (type === 'CORRECTION') {
                if (!cSubject.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'address'] });
                if (!cSubject.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'block'] });
                if (!cSubject.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'neighborhoodUnit'] });
                if (!cSubject.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'communityUnit'] });
                if (!cSubject.subdistrict) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'subdistrict'] });
                if (!cSubject.village) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Desa/Kelurahan asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxSubjectData', 'village'] });

                if (!cObject.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'address'] });
                if (!cObject.block) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Blok objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'block'] });
                if (!cObject.neighborhoodUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RT objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'neighborhoodUnit'] });
                if (!cObject.communityUnit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RW objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'communityUnit'] });
                if (!cObject.subdistrict) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Kecamatan objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'subdistrict'] });
                if (!cObject.village) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Desa/Kelurahan objek asal wajib diisi untuk Pembetulan', path: ['complementary', idx, 'taxObjectData', 'village'] });
            }
        });
    });

// Alias & Types
export const applicationFormSchema = applicationCreateSchema;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationFormInput = ApplicationCreateInput;

export type TaxSubjectInput = z.infer<typeof taxSubjectSchema>;
export type TaxObjectInput = z.infer<typeof taxObjectSchema>;
export type ComplementaryDataInput = z.infer<typeof complementaryDataSchema>;
