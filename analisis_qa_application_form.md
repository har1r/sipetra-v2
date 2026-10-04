# Analisis Quality Assurance (QA) Komponen `ApplicationForm.tsx`

Dokumen ini memuat analisis mendalam terhadap 5 poin temuan kelemahan pada komponen [`ApplicationForm.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/components/ApplicationForm.tsx), dampak perubahannya terhadap sistem (Frontend & Backend), serta rekomendasi solusi *best practice* yang aman dan efisien.

---

## Ringkasan Matriks Dampak Risiko

| No | Temuan Kelemahan | Tingkat Urgensi | Potensi Merusak Komponen Lain? | Rekomendasi Tindakan |
| :-: | :--- | :-: | :-: | :--- |
| **1** | Duplikasi Autentikasi (`useSession` vs `getServerSession`) | Sedang | **TIDAK MERUSAK** (100% Aman) | Teruskan `userRole` via *props* dari Server Component (`page.tsx`). |
| **2** | API Route Campuran untuk Upload File (`/api/upload`) | Rendah | **BISA BERISIKO** jika dipaksa Server Action | **Pertahankan API Route** (pola standar & optimal untuk upload berkas). |
| **3** | Tombol Submit di Luar Elemen `<form>` | Sedang | **TIDAK MERUSAK** (100% Aman) | Bungkus dengan tag `<form onSubmit={handleSubmit(onSubmit)}>`. |
| **4** | Pelanggaran Type Safety (`as any` & `any`) | Sedang-Tinggi | **TIDAK MERUSAK** jika skema tetap sinkron | Rapikan type casting; pasang NextAuth Type Augmentation. |
| **5** | Manipulasi DOM Langsung (`document.querySelector`) | Rendah | **TIDAK MERUSAK** (Aman & Pragmatis) | Aman dipertahankan untuk scroll error dinamis. |

---

## 1. Analisis Duplikasi Autentikasi (Server vs Client Session)

### Kondisi Saat Ini
Halaman pembungkus ([`submission/new/page.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/app/(dashboard)/dashboard/workflow/(front-officer)/submission/new/page.tsx) dan [`applications/[id]/edit/page.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/app/(dashboard)/dashboard/workflow/applications/[id]/edit/page.tsx)) sudah melakukan verifikasi sesi di server:
```tsx
const session = await getServerSession(authOptions);
if (!session) redirect('/login');
```
Namun, di dalam [`ApplicationForm.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/components/ApplicationForm.tsx), kembali dipanggil:
```tsx
const { data: session } = useSession();
const userRole = (session?.user as any)?.role;
```
Panggilan ini **hanya digunakan sekali** untuk menentukan arah redirect setelah submit edit:
- Jika `VERIFICATOR` $\to$ `/dashboard/workflow/verifikasi`
- Jika `FRONT_OFFICER` $\to$ `/dashboard/workflow/submission`

### Evaluasi & Dampak
- **Kelemahan:** Memanggil `useSession()` memicu request HTTP latar belakang ke `/api/auth/session` di sisi client atau mewajibkan `SessionProvider`, yang menghasilkan overhead jaringan kecil yang tidak perlu.
- **Apakah Merusak Komponen Lain?:** **TIDAK.**
- **Solusi Best Practice:**
  Cukup tambahkan prop opsional `userRole?: UserRole` pada interface `ApplicationFormProps`:
  ```tsx
  interface ApplicationFormProps {
      mode: 'create' | 'edit' | 'duplicate';
      initialData?: ApplicationFormInput & { id?: string };
      userRole?: UserRole;
      onSuccess?: (result: { id: string; applicationId: string }) => void;
  }
  ```
  Di `page.tsx`, kirimkan: `<ApplicationForm mode="..." userRole={session.user.role as UserRole} />`. Dengan ini, impor `useSession` di form dapat dihapus seutuhnya.

---

## 2. Penggunaan API Route Campuran di Era Server Actions (`fetch('/api/upload')`)

### Kondisi Saat Ini
Data teks permohonan disimpan melalui Server Actions (`createApplication`, `editApplication`), namun file PDF/foto diunggah secara mandiri melalui API Route:
```tsx
const res = await fetch('/api/upload', {
    method: 'POST',
    body: uploadFormData,
});
```

### Evaluasi & Pertimbangan Arsitektur
- **Apakah ini Anti-Pattern?:** **TIDAK.** 
  Di Next.js (App Router), menangani unggah file biner multipart melalui **Route Handler (`/api/upload/route.ts`) justru merupakan pola yang paling direkomendasikan dan stabil**, dengan alasan:
  1. **Batas Ukuran Payload Server Actions:** Next.js membatasi body payload Server Actions secara ketat (default 1MB). Unggahan berkas scan sertifikat/KTP/PBB seringkali berukuran 2MB – 10MB.
  2. **Streaming & Memory Efficiency:** API Route bekerja secara streaming langsung ke disk atau penyimpanan cloud (S3/Cloudinary/GridFS) tanpa harus mem-parse seluruh request ke dalam memori eksekusi server action.
  3. **Pemisahan Tanggung Jawab (*Separation of Concerns*):** File diunggah terlebih dahulu, URL/nama berkas didapat, lalu URL tersebut disimpan bersama data form via Server Action.
- **Apakah Jika Diubah ke Server Action Berpotensi Merusak?:**
  **YA, BERPOTENSI BERMASALAH.** Jika file diubah ke Server Action, Next.js akan menolak request jika ukuran file melebihi limit sebelum kita mengubah `serverActions.bodySizeLimit` di `next.config.mjs`.
- **Rekomendasi:**
  **Tetap pertahankan `/api/upload`**. Ini adalah arsitektur yang tepat untuk file upload di Next.js modern.

---

## 3. Penanganan Tombol Submit di Luar Elemen `<form>`

### Kondisi Saat Ini
Komponen membungkus seluruh formulir hanya dengan `<div>` dan tombol submit di langkah 4 dipicu oleh:
```tsx
<button type="button" onClick={handleSubmit(onSubmit)}>
```

### Evaluasi & Dampak
- **Kelemahan:**
  1. Tidak memenuhi semantik HTML (`<form>`).
  2. Tombol keyboard `Enter` tidak dapat digunakan secara wajar untuk submit.
  3. Aksesibilitas (*a11y*) dan autofill browser tidak optimal.
- **Mengapa Dibuat Seperti Itu?:**
  Pada form multi-langkah (*wizard*), jika form dibungkus `<form>`, menekan `Enter` di Langkah 1 (misal saat mengetik NOP) berisiko memicu submit prematur ke backend padahal langkah 2–4 belum diisi.
- **Apakah Merusak Komponen Lain?:** **TIDAK.**
- **Solusi Best Practice:**
  Bungkus kontainer utama dengan `<form onSubmit={handleSubmit(onSubmit)} noValidate>`.
  Untuk mencegah submit prematur via tombol `Enter` pada langkah 1 s.d. 3:
  ```tsx
  <form
      onSubmit={(e) => {
          if (currentStepIndex < totalSteps - 1) {
              e.preventDefault(); // Cegah submit jika belum di langkah terakhir
              return;
          }
          handleSubmit(onSubmit)(e);
      }}
      noValidate
  >
  ```
  Tombol navigasi langkah (Sebelumnya/Lanjut) tetap `type="button"`, dan tombol di langkah terakhir diubah menjadi `type="submit"`.

---

## 4. Pelanggaran Type Safety (`as any` dan `any`)

### Kondisi Saat Ini
Terdapat beberapa *type escape hatch* di [`ApplicationForm.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/components/ApplicationForm.tsx):
1. `resolver: zodResolver(applicationFormSchema as any)`
2. `applicationType: '' as any` (pada `defaultValues`)
3. `(session?.user as any)?.role`
4. `(item: any)` pada pemetaan `complementary`

### Evaluasi & Dampak
- **Penyebab:**
  1. `applicationFormSchema` memiliki logika validasi percabangan dinamis sehingga tipe inferensi Zod sedikit berbeda dari definisi state awal form (misal `applicationType: ''` bukan bagian dari enum sebelum dipilih).
  2. Modul NextAuth belum memiliki file deklarasi augmentasi `types/next-auth.d.ts` sehingga TypeScript tidak tahu bahwa `session.user` memiliki properti `role`.
- **Apakah Merusak Komponen Lain?:**
  **TIDAK.** Selama skema Zod di [`application.schema.ts`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/schemas/application.schema.ts) tidak diubah struktur field-nya, merapikan tipe di dalam form tidak akan berdampak ke backend maupun tabel data.
- **Solusi Best Practice:**
  - Tambahkan file `types/next-auth.d.ts` agar `session.user.role` ter-typing otomatis.
  - Sederhanakan casting dengan tipe yang eksplisit (misal `ApplicationFormInput['applicationType']` atau enum bawaan) alih-alih `as any`.

---

## 5. Manipulasi DOM Secara Langsung (`document.querySelector`)

### Kondisi Saat Ini
Fungsi `scrollToFirstError` mencari elemen dengan selector:
```tsx
const firstErrorEl = document.querySelector<HTMLElement>(
    '[data-error="true"], .text-rose-500, [aria-invalid="true"]'
);
firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
```

### Evaluasi & Dampak
- **Kelemahan Teoritis:** Di React murni, manipulasi DOM langsung biasanya dihindari demi *declarative programming*.
- **Kenyataan Praktis:** 
  Pada formulir panjang yang dinamis (banyak field yang muncul bersyarat berdasarkan `applicationType`), membuat puluhan `useRef` untuk setiap input justru menciptakan kode yang sangat membengkak (*boilerplate* yang tidak perlu).
- **Apakah Berbahaya / Merusak?:**
  **SAMA SEKALI TIDAK.** Fungsi ini murni *read-only* (hanya membaca posisi elemen di viewport lalu memanggil `.scrollIntoView()`). Fungsi ini tidak memodifikasi Virtual DOM React, tidak mengubah state, dan tidak merusak lifecycle komponen.
- **Rekomendasi:**
  **Aman dipertahankan**. Ini adalah pola standar yang sangat pragmatis untuk UX form panjang di React.

---

## Kesimpulan & Panduan Tindakan QA

Jika Anda ingin merapikan kelemahan di atas:
1. **Paling Disarankan Dikerjakan Segera:** 
   - Poin 1 (Teruskan `userRole` via props, hapus `useSession`).
   - Poin 3 (Bungkus form dengan tag semantik `<form>` dan kontrol tombol `Enter`).
2. **Sangat Disarankan Tetap Dipertahankan (Bukan Bug):**
   - Poin 2 (Tetap gunakan `/api/upload` untuk efisiensi berkas biner).
   - Poin 5 (Tetap gunakan `scrollToFirstError` via querySelector untuk efisiensi ref).
3. **Poin 4 (Type Safety):**
   - Dapat dirapikan bertahap tanpa khawatir merusak fungsionalitas aplikasi.
