Viewed schema.prisma:40-175
Listed directory sipetra_v2
Listed directory components
Listed directory dashboard
Listed directory ui
Listed directory shared
Listed directory features
Listed directory data-entry
Listed directory data-entry
Listed directory components
Listed directory lib
Listed directory %28dashboard%29
Listed directory dashboard
Viewed Sidebar.tsx:70-140
Viewed Sidebar.tsx:141-235
Viewed Sidebar.tsx:236-386
Viewed DashboardContext.tsx:1-100
Listed directory home
Viewed page.tsx:1-11
Viewed HomePage.tsx:1-18
Listed directory types

Rencana dan langkah-langkah implementasi fitur **Create & Edit Permohonan (`createApplication` / `submitApplication` & `editApplication`)** untuk workspace **Data Entry** dirancang berdasarkan prinsip **Next.js App Router (React 19) Best Practice** dan pemanfaatan skema Prisma yang sudah ada.

---

### Prinsip Desain & Arsitektur

1. **Single Source of Truth Form (`ApplicationForm`)**:
   - Komponen form yang sama digunakan untuk **Create** maupun **Edit**.
   - Menerima props mode: `mode: 'create' | 'edit'` dan `initialData?: Application`.
2. **Sub-form Modular & Reusable**:
   - Skema Prisma memiliki dua tipe data berulang: `TaxSubjectData` dan `TaxObjectData` (digunakan baik di `ComplementaryData` maupun `RequestedData`).
   - Dibuat sub-komponen terisolasi: `<TaxSubjectForm />` dan `<TaxObjectForm />` sehingga tidak ada duplikasi input form.
3. **Logika Dinamis Berdasarkan `ApplicationType`**:
   - **`NEW_TAX_OBJECT`**: Hanya mengisi `RequestedData` (karena belum memiliki NOP asal).
   - **`PARTIAL_MUTATION` (Pecah NOP)**: 1 NOP Asal (`ComplementaryData`) $\rightarrow$ multi NOP Dimohon (`RequestedData[]`).
   - **`MERGER_MUTATION` (Gabung NOP)**: multi NOP Asal (`ComplementaryData[]` dengan flag `isPrimary`) $\rightarrow$ 1 NOP Hasil (`RequestedData`).
   - **`CORRECTION` / `EXPIRED_UPDATE` / `REACTIVATION`**: 1 NOP Asal $\rightarrow$ 1 NOP Dimohon.
4. **Server Actions + React 19 `useActionState` / `useTransition`**:
   - Validasi data di Server & Client menggunakan **Zod**.
   - Menyimpan audit log ke model `AuditLog` (`AuditAction.CREATE` / `AuditAction.REVISE_DATA`).
   - Revalidasi cache via `revalidatePath`.

---

### Langkah-Langkah Implementasi

```
features/data-entry/
├── actions/
│   └── application.actions.ts        # Server Actions (createApplication, editApplication, getApplication)
├── schemas/
│   └── application.schema.ts         # Skema Zod untuk validasi form per ApplicationType
├── components/
│   ├── subforms/
│   │   ├── TaxSubjectForm.tsx        # Reusable form Subjek Pajak (Nama, WA, Alamat, RT/RW, Kec/Desa)
│   │   └── TaxObjectForm.tsx         # Reusable form Objek Pajak (NOP, Luas, Sertifikat, Alamat Objek)
│   ├── ApplicationForm.tsx           # Form utama (mendukung Create & Edit)
│   └── ApplicationTypeSelector.tsx   # Pemilih jenis permohonan berdasar enum ApplicationType
└── hooks/
    └── useApplicationForm.ts         # Hook state management form (React Hook Form + Zod)
```

---

#### Tahap 1: Validasi Skema Zod & Types
- Membuat [features/data-entry/schemas/application.schema.ts](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/features/data-entry/schemas/application.schema.ts):
  - `taxSubjectSchema` & `taxObjectSchema`
  - `complementaryDataSchema` & `requestedDataSchema`
  - `applicationFormSchema` dengan validasi kondisional sesuai `ApplicationType` (misal: validasi format NOP 18 digit, tanggal penyelesaian).

#### Tahap 2: Server Actions
- Membuat [features/data-entry/actions/application.actions.ts](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/features/data-entry/actions/application.actions.ts):
  - **`createApplication(data)`**: Validasi sesi login user (Role: `DATA_ENTRY` / `SUPERVISOR`), generate nomor permohonan/NOPEL otomatis, simpan ke database MongoDB melalui Prisma, dan catat `AuditLog`.
  - **`editApplication(id, data)`**: Cek apakah status permohonan masih dapat diedit (`SUBMITTED` atau `REVISION`), update data di Prisma, catat `AuditLog` dengan aksi `REVISE_DATA`.
  - **`getApplicationById(id)`**: Mengambil data lengkap untuk mengisi nilai awal (*initial values*) pada mode edit.

#### Tahap 3: Reusable Sub-Form Components
- [TaxSubjectForm.tsx](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/features/data-entry/components/subforms/TaxSubjectForm.tsx):
  - Mengelola input Nama, No. WhatsApp, Alamat Wajib Pajak, Blok, RT, RW, Kecamatan, Kelurahan/Desa.
- [TaxObjectForm.tsx](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/features/data-entry/components/subforms/TaxObjectForm.tsx):
  - Mengelola input NOP (18 digit format otomatis), Luas Tanah ($m^2$), Luas Bangunan ($m^2$), Nomor Sertifikat, dan Alamat Objek.
- Keduanya menerima `prefix` path form (misal: `complementaryData.0.taxSubjectData` atau `requestedData.0.taxSubjectData`) sehingga dapat digunakan di bagian mana saja tanpa mengubah logika.

#### Tahap 4: Form Utama (`ApplicationForm.tsx`)
- Menggabungkan:
  1. Header informasi: Nomor Pelayanan, Tanggal Masuk, Estimasi Tanggal Selesai.
  2. Pemilihan `ApplicationType` (dengan penjelasan konteks per jenis).
  3. Bagian **Data Asal / Eksisting (`ComplementaryData`)** — otomatis disembunyikan jika tipe `NEW_TAX_OBJECT`.
  4. Bagian **Data Yang Dimohonkan (`RequestedData`)** — mendukung tombol *Tambah Objek Pecahan* untuk `PARTIAL_MUTATION`.
  5. Tombol aksi: Simpan Draf, Ajukan Permohonan (`submitApplication`), atau Perbarui Permohonan (`editApplication`).

#### Tahap 5: Integrasi Halaman Workspace & Feedback
- Menghubungkan form ke workspace di [app/(dashboard)/dashboard/workflow/pengajuan/page.tsx](file:///c:/Users/Pavilion/Desktop/sipetra-v2/app/%28dashboard%29/dashboard/workflow/pengajuan/page.tsx) (atau route baru `/dashboard/applications/new` dan `/dashboard/applications/[id]/edit`).
- Menggunakan komponen [NotificationSystem.tsx](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/components/shared/NotificationSystem.tsx) dan dialog konfirmasi yang sudah ada di [DashboardContext.tsx](file:///c:/Users/AIO%20SAKA/Desktop/sipetra_v2/context/DashboardContext.tsx) untuk feedback sukses/gagal.

---

Apakah langkah-langkah di atas sudah sesuai dengan kebutuhan alur sistem yang Anda inginkan? Jika sudah oke, kita bisa langsung mulai dari **Tahap 1 (Skema Zod)** dan **Tahap 2 (Server Actions)**.