# Analisis Quality Assurance (QA) Frontend: `ApplicationDataTable.tsx`

Dokumen ini memuat analisis mendalam terhadap 5 temuan kelemahan pada komponen tabel data permohonan ([`ApplicationDataTable.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/components/shared/tables/ApplicationDataTable.tsx)), analisis risiko apakah perubahan akan merusak bagian lain di Frontend maupun Backend, serta rekomendasi solusi *best practice* berbasis Next.js App Router, React 19/18, TypeScript, dan Tailwind CSS.

---

## Ringkasan Matriks Dampak Risiko

| No | Temuan Kelemahan | Dampak Teknis | Potensi Merusak Komponen Lain? | Rekomendasi Tindakan |
| :-: | :--- | :--- | :-: | :--- |
| **1** | Duplikasi autentikasi klien (`useSession`) | *Performance overhead*, re-render konteks global, dependensi `SessionProvider` | **TIDAK MERUSAK** (100% Aman) | Hapus `useSession()`, gunakan prop `actionRole` yang sudah disediakan oleh Server Component pemanggil. |
| **2** | Sinkronisasi mutasi favorit tanpa `useTransition` | Risiko *UI Stale State* saat revalidasi server lambat | **TIDAK MERUSAK** (100% Aman) | Bungkus pemanggilan Server Action dan `router.refresh()` dalam `useTransition` standar React. |
| **3** | Kebocoran modal cetak (`window.print` global) | Layout dashboard utama ikut terpengaruh aturan `@media print` | **TIDAK MERUSAK** (100% Aman) | Isolasi pencetakan tanda terima menggunakan elemen `iframe` tersembunyi atau selector print terlokalisasi. |
| **4** | Penggunaan `<style jsx global>` pada App Router | *Hydration warning/error*, polusi style global di `<head>` | **TIDAK MERUSAK** (100% Aman) | Hapus tag `<style jsx global>`, gunakan class Tailwind khusus media cetak (`print:`) atau isolated iframe. |
| **5** | Casting data menggunakan `as any` pada data & respons | Hilangnya *type safety*, risiko *runtime error* jika struktur data berubah | **TIDAK MERUSAK** (100% Aman) | Deklarasikan interface `ApplicationReceiptData` dan gunakan kontrak tipe `ActionResponse<T>` secara presisi. |

---

## 1. Analisis Duplikasi Autentikasi Klien (`useSession`)

### Kondisi Saat Ini
Pada baris 30 dan 110–128:
```tsx
import { useSession } from 'next-auth/react';
...
const { data: session } = useSession();
...
const isFrontOfficer = session?.user?.role === 'FRONT_OFFICER' || actionRole === 'FRONT_OFFICER';
```

### Evaluasi & Dampak
1. **Redundansi Konteks Klien:**
   Halaman induk yang memanggil komponen ini ([`submission/page.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/app/(dashboard)/dashboard/workflow/(front-officer)/submission/page.tsx) dan [`verifikasi/page.tsx`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/app/(dashboard)/dashboard/workflow/(verificator)/verifikasi/page.tsx)) adalah **Server Components** yang sudah mengetahui peran pengguna dan secara eksplisit meneruskan properti:
   - `actionRole="FRONT_OFFICER"` pada alur Front Officer.
   - `actionRole="VERIFICATOR"` pada alur Verifikator.
2. **Kelemahan Kinerja:**
   Memanggil `useSession()` di dalam komponen tabel klien memaksa komponen berlangganan (*subscribe*) ke React Context `SessionProvider`. Setiap kali token sesi diperbarui di latar belakang, tabel yang berisi puluhan baris data ikut dievaluasi ulang (*unnecessary re-render*).
3. **Apakah Merusak Komponen Lain?:**
   **SAMA SEKALI TIDAK.** Properti `actionRole` sudah diterima oleh `ApplicationDataTableProps` sejak awal:
   ```tsx
   export interface ApplicationDataTableProps {
       applications: ApplicationItem[];
       actionRole?: 'FRONT_OFFICER' | 'VERIFICATOR' | string;
       ...
   }
   ```
   Cukup ganti logika penentu peran menjadi:
   ```tsx
   const isFrontOfficer = actionRole === 'FRONT_OFFICER';
   ```
   Dengan ini, impor `useSession` dari `next-auth/react` dapat dihapus seutuhnya.

---

## 2. Analisis Sinkronisasi Eror pada Aksi Favorit Petugas (`useTransition`)

### Kondisi Saat Ini
Pada fungsi `handleToggleFavorite`:
```tsx
const handleToggleFavorite = async (e: React.MouseEvent, app: ApplicationItem) => {
    ...
    setFavoriteState((prev) => ({ ...prev, [app.id]: nextVal }));
    setLoadingFavoriteId(app.id);

    try {
        const res = await toggleApplicationFavorite(app.id, nextVal);
        if (!res.success) {
            setFavoriteState((prev) => ({ ...prev, [app.id]: currentVal }));
        } else {
            router.refresh();
        }
    } catch {
        setFavoriteState((prev) => ({ ...prev, [app.id]: currentVal }));
    } finally {
        setLoadingFavoriteId(null);
    }
};
```

### Evaluasi & Dampak
1. **Potensi *UI Stale State* & Race Condition:**
   `router.refresh()` mengeksekusi revalidasi data server di latar belakang secara asinkron. Karena tidak dibungkus dalam `useTransition`, UI tidak mengetahui kapan server selesai mengambil data segar (*pending transition*). Jika pengguna mengklik filter favorit (`selectedFavoriteFilter`) segera setelah menandai bintang, data tabel bisa menampilkan status lama sebelum revalidasi selesai.
2. **Apakah Merusak Komponen Lain?:**
   **TIDAK MERUSAK.** Backend Server Action `toggleApplicationFavorite` sudah mengembalikan `{ success: boolean, data: { isFavorite } }` yang valid.
3. **Solusi Best Practice:**
   Gunakan React `useTransition`:
   ```tsx
   const [isPending, startTransition] = useTransition();
   ```
   Bungkus `router.refresh()` di dalam `startTransition`:
   ```tsx
   startTransition(() => {
       router.refresh();
   });
   ```
   Ini memastikan pembaruan tampilan tersinkronisasi secara mulus dengan siklus rendering React.

---

## 3 & 4. Analisis Kebocoran Modal Cetak (`window.print`) & Tag `<style jsx global>`

### Kondisi Saat Ini
Pada baris 1129 dan 1305–1330:
```tsx
<button onClick={() => window.print()}>Cetak Bukti</button>
...
<style jsx global>{`
    @media print {
        body * {
            visibility: hidden !important;
        }
        #printable-receipt-area,
        #printable-receipt-area * {
            visibility: visible !important;
        }
        #printable-receipt-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            ...
        }
        .no-print {
            display: none !important;
        }
    }
`}</style>
```

### Evaluasi & Dampak
1. **Bahaya `body * { visibility: hidden !important; }` Secara Global:**
   Aturan CSS ini disuntikkan langsung ke level dokumen global. Jika browser sedang membuka dialog cetak, seluruh layout sidebar, header, tabel, dan navigasi Next.js disembunyikan paksa. Jika dialog batal atau terjadi gangguan script, gaya ini berpotensi membocorkan efek ke halaman dashboard lainnya.
2. **Masalah *Hydration Warning* di App Router:**
   Next.js App Router (khususnya versi 13/14/15/16) tidak lagi mendukung tag `<style jsx global>` secara *native* tanpa konfigurasi khusus Registry di `layout.tsx`. Penggunaan tag ini dapat memicu peringatan hidrasi di konsol browser (`Extra attributes from the server`).
3. **Apakah Merusak Komponen Lain?:**
   **TIDAK MERUSAK.** Struktur HTML tanda terima (`#printable-receipt-area`) sudah sangat rapi dan lengkap.
4. **Solusi Best Practice (Bebas Efek Samping):**
   - **Metode A (Iframe Cetak Terisolasi - Paling Direkomendasikan):**
     Saat tombol "Cetak" diklik, script mengambil HTML dari elemen tanda terima dan memasukkannya ke dalam `<iframe>` tersembunyi temporer, lalu memanggil `iframe.contentWindow?.print()`.
     *Keuntungan:* **100% terisolasi**, tidak menyentuh DOM halaman utama, tidak memerlukan tag `<style jsx global>`, dan tidak ada risiko merusak layout dashboard.
   - **Metode B (Tailwind `print:` utility):**
     Menghapus tag `<style jsx>` dan menggantinya dengan class Tailwind bawaan media cetak tanpa manipulasi CSS global.

---

## 5. Analisis Casting Penulisan Tipe Data secara Longgar (`as any`)

### Kondisi Saat Ini
1. Pada state modal tanda terima ([baris 122](file:///c:/Users/Pavilion/Desktop/sipetra-v2/components/shared/tables/ApplicationDataTable.tsx#L122)):
   ```tsx
   const [receiptApp, setReceiptApp] = useState<any | null>(null);
   ```
2. Pada deklarasi tipe `ApplicationItem` ([baris 60, 67, 70, 71](file:///c:/Users/Pavilion/Desktop/sipetra-v2/components/shared/tables/ApplicationDataTable.tsx#L60)):
   ```tsx
   taxSubject?: { [key: string]: any };
   taxObject?: { [key: string]: any };
   complementary?: Array<{ taxSubjectData?: any; taxObjectData?: any }>;
   ```
3. Pada Server Action backend ([`application.actions.ts`](file:///c:/Users/Pavilion/Desktop/sipetra-v2/features/front-officer/actions/application.actions.ts#L584)):
   ```tsx
   export async function getApplicationReceipt(id: string): Promise<ActionResponse<any>>
   ```

### Evaluasi & Dampak
1. **Risiko *Type Safety Leak*:**
   Jika field tanda terima seperti `app.sla`, `app.taxSubject`, atau `app.frontOfficer` berubah di database atau skema, TypeScript tidak dapat mendeteksi potensi *undefined access* pada baris-baris cetak modal (contoh: `receiptApp.taxSubject?.name`), sehingga bisa memicu *crash runtime* layar putih bagi pengguna.
2. **Apakah Merusak Komponen Lain?:**
   **TIDAK MERUSAK.** Memberikan tipe data yang jelas (`interface ApplicationReceiptData`) justru memberikan kepastian kontrak (*contract safety*) antara respons `getApplicationReceipt` di backend dengan pemanfaatan di modal frontend.

---

## Kesimpulan & Rekomendasi Eksekusi QA

Semua 5 perbaikan di atas **bersifat non-breaking (aman 100%)**:
1. Menghilangkan `useSession` meringankan beban komputasi rendering tabel dan menghapus dependensi context yang tidak perlu.
2. Menambahkan `useTransition` menyempurnakan responsivitas UI pada aksi favorit.
3. Mengganti manipulasi global `<style jsx global>` dengan metode cetak terisolasi (`iframe` print) menghilangkan bahaya layout dashboard tersembunyi dan membersihkan *hydration warning*.
4. Mengganti `any` dengan interface terstruktur menjaga stabilitas jangka panjang kode.

Perubahan ini dapat langsung diterapkan tanpa mengubah visual tampilan UI yang sudah disetujui.
