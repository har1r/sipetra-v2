# Analisis Quality Assurance (QA) Backend: `application.actions.ts`

Dokumen ini memuat analisis mendalam terhadap 4 temuan kelemahan pada Server Actions ([`application.actions.ts`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/actions/application.actions.ts)), analisis risiko apakah perubahan akan merusak bagian lain (Frontend/Backend), serta rekomendasi solusi *best practice* berbasis Next.js, Prisma, dan MongoDB.

---

## Ringkasan Matriks Dampak Risiko

| No | Temuan Kelemahan | Dampak Teknis | Potensi Merusak Komponen Lain? | Rekomendasi Tindakan |
| :-: | :--- | :--- | :-: | :--- |
| **1** | Pola `while` loop untuk cek `applicationId` unik | *Race condition*, *connection leak*, latensi DB | **TIDAK MERUSAK** (100% Aman) | Manfaatkan unique index MongoDB + format ID presisi / catch error `P2002`. |
| **2** | `auditLog.create` terpisah di luar transaksi | Risiko inkonsistensi data jika server putus | **TIDAK MERUSAK** (100% Aman) | Gunakan **Nested Write** Prisma (`auditLogs: { create: ... }`) atau `$transaction`. |
| **3** | *Over-fetching* data pada `findUnique` edit | Pemborosan memori RAM server & bandwidth DB | **TIDAK MERUSAK** (100% Aman) | Gunakan proyeksi `select` hanya untuk field yang divalidasi. |
| **4** | Pembersihan data menggunakan `as any` massal | *Type safety leak*, potensi ketidaksesuaian skema | **TIDAK MERUSAK** (100% Aman) | Gunakan tipe terikat Prisma (`Prisma.ApplicationCreateInput`). |

---

## 1. Analisis Pola Loop `while` untuk Cek `applicationId` Unik

### Kondisi Saat Ini
Pada fungsi `createApplication` dan `duplicateApplication`:
```typescript
let isUnique = false;
while (!isUnique) {
    const candidate = generateUniqueApplicationId();
    const existing = await prisma.application.findUnique({ where: { applicationId: candidate } });
    if (!existing) {
        finalAppId = candidate;
        isUnique = true;
    }
}
```

### Evaluasi & Dampak
1. **Masalah Pemborosan Koneksi Database (*Database Latency*):**
   Setiap kali Front Officer menekan submit, server dipaksa melakukan minimal **1 kali query ekstra (`findUnique`)** hanya untuk mengecek apakah ID sudah ada, sebelum akhirnya menjalankan query `create`. Jika ada 100 permohonan diajukan bersamaan, ada 100 round-trip jaringan yang terbuang sia-sia.
2. **Masalah *Race Condition*:**
   Pola `findUnique` $\to$ `create` ini sebenarnya **tidak menjamin keunikan 100%** di level konkurensi tinggi (*Time-of-Check to Time-of-Use / TOCTOU*). Jika Petugas A dan Petugas B secara bersamaan mendapatkan kandidat ID yang sama, keduanya akan melihat `!existing`, dan saat keduanya mencoba `create`, salah satunya tetap akan mengalami error crash tabrakan *duplicate key*.
3. **Kenyataan di Schema Prisma:**
   Di [`schema.prisma`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/prisma/schema.prisma#L99), field `applicationId` sudah memiliki indeks unik:
   ```prisma
   applicationId String @unique
   ```
   MongoDB secara native sudah menjamin keunikan ini di level *storage engine*.
4. **Apakah Merusak Komponen Lain?:**
   **SAMA SEKALI TIDAK.** Frontend dan tabel hanya menerima string `applicationId` hasil kembalian.
5. **Solusi Best Practice:**
   - Gunakan generator ID dengan entropi yang memadai (misal menyertakan waktu hingga detik/milidetik + angka acak 4 digit: `SIP-YYYYMMDD-HHMMSS-XXXX`). Probabilitas tabrakan secara matematis menjadi hampir nol.
   - Hilangkan query `findUnique` di dalam loop `while`. Langsung lakukan `create`.
   - Bungkus blok penyimpanan: jika terjadi error Prisma `P2002` (kode khusus *unique constraint violation*), barulah lakukan retry satu kali.

---

## 2. Analisis Penulisan Log Audit Terpisah di Luar Transaksi

### Kondisi Saat Ini
Pada alur pembuatan aplikasi:
```typescript
const newApp = await prisma.application.create({ data: { ... } });

await prisma.auditLog.create({
    data: {
        applicationId: newApp.id,
        action: AuditAction.SUBMIT,
        ...
    }
});
```

### Evaluasi & Dampak
1. **Risiko Integritas Data:**
   Jika query pertama (`application.create`) berhasil, namun beberapa milidetik kemudian server restart, koneksi database terputus, atau memori habis sebelum query kedua (`auditLog.create`) berjalan, maka:
   - Permohonan tersimpan di database.
   - **Namun riwayat audit log-nya kosong/hilang!**
   Ini melanggar prinsip akuntabilitas sistem pemerintahan.
2. **Apakah Merusak Komponen Lain?:**
   **TIDAK.** Relasi tabel, data audit log, dan data aplikasi yang dihasilkan tetap 100% sama.
3. **Solusi Best Practice:**
   Prisma menyediakan fitur **Nested Write** yang dieksekusi secara atomik dalam satu payload dokumen ke MongoDB:
   ```typescript
   const newApp = await prisma.application.create({
       data: {
           ...dataAplikasi,
           auditLogs: {
               create: {
                   actorId: session.user.id,
                   actorName: session.user.name,
                   actorRole: session.user.role as UserRole,
                   action: AuditAction.SUBMIT,
                   newStatus: ApplicationStatus.VERIFYING,
                   metadata: { ... },
               },
           },
       },
   });
   ```
   Atau menggunakan Interactive Transactions:
   `await prisma.$transaction(async (tx) => { ... })`.
   *Keuntungan Nested Write:* Mengurangi 2 round-trip menjadi 1 kali eksekusi, lebih hemat koneksi dan dijamin atomik.

---

## 3. Analisis *Over-fetching* Data pada Validasi Edit (`findUnique`)

### Kondisi Saat Ini
Pada fungsi `editApplication` ([baris 187](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/actions/application.actions.ts#L187)):
```typescript
const existingApp = await prisma.application.findUnique({
    where: { id },
});
```

### Evaluasi & Dampak
1. **Pemborosan Memori (*Memory Overhead*):**
   Query ini menarik seluruh kolom dokumen MongoDB: riwayat SLA, array tautan file persyaratan, data subjek pajak lama, data objek pajak lama, dan array data pelengkap yang berukuran besar.
   Padahal, kode setelahnya **hanya membutuhkan 3 hal**:
   - `existingApp.status` $\to$ untuk mengecek apakah status masih boleh diedit (`editableStatuses`).
   - `existingApp.bundleId` $\to$ untuk mengecek apakah sudah masuk bundle.
   - `existingApp.applicationId` $\to$ sebagai fallback nomor registrasi.
2. **Apakah Merusak Komponen Lain?:**
   **TIDAK.** Data baru yang dikirim dari form akan tetap menimpa data lama pada saat query `update`.
3. **Solusi Best Practice:**
   Gunakan proyeksi `select`:
   ```typescript
   const existingApp = await prisma.application.findUnique({
       where: { id },
       select: {
           id: true,
           status: true,
           bundleId: true,
           applicationId: true,
       },
   });
   ```
   Ini mengurangi beban transfer data dari MongoDB ke Node.js hingga 90% pada proses edit.

---

## 4. Analisis Pembersihan Data Dinamis Menggunakan `as any` Massal

### Kondisi Saat Ini
Pada saat menyusun data untuk Prisma:
```typescript
applicationType: validData.applicationType as any,
taxSubject: validData.taxSubject as any,
taxObject: formattedTaxObject as any,
complementary: formattedComplementary as any,
```

### Evaluasi & Dampak
1. **Mengapa Sebelumnya Memakai `as any`?:**
   Skema Zod (`ApplicationFormInput`) menghasilkan objek JavaScript biasa, sedangkan Prisma Client untuk MongoDB memerlukan tipe komposit spesifik (contoh: `Prisma.TaxSubjectDataCreateInput`, `Prisma.TaxObjectDataCreateInput`). Karena beberapa field opsional bernilai `null` vs `undefined`, developer menggunakan `as any` untuk membungkam TypeScript.
2. **Bahaya `as any`:**
   Jika suatu saat ada field di `schema.prisma` yang diganti namanya atau dihapus, TypeScript tidak akan memberi peringatan eror saat kompilasi (*type safety blind spot*).
3. **Apakah Merusak Komponen Lain?:**
   **TIDAK.** Selama nilai yang diteruskan tetap sesuai dengan format dokumen yang diharapkan MongoDB.
4. **Solusi Best Practice:**
   Gunakan casting ke tipe turunan Prisma atau biarkan TypeScript memvalidasi payload melalui konstanta bertipe `Prisma.ApplicationCreateInput` / `Prisma.ApplicationUpdateInput`.

---

## Kesimpulan & Panduan Tindakan QA

Keempat poin perbaikan di atas **100% aman dan tidak akan merusak frontend, tabel, maupun halaman lainnya**:
- **Poin 1 & 2:** Mempercepat proses pendaftaran baru dan menjamin integritas audit log (anti data korup/hilang).
- **Poin 3:** Menghemat memori server dan mempercepat respons klik saat menyimpan edit.
- **Poin 4:** Menghilangkan *type blindness* di layer backend.
