'use client';

import React from 'react';
import { ArrowLeft, Printer, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { APPLICATION_TYPE_LABELS, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';

interface BundlePrintViewProps {
  bundle: any;
}

export function BundlePrintView({ bundle }: BundlePrintViewProps) {
  const isMutasiHabis =
    bundle.applicationType === 'EXPIRED_UPDATE' ||
    bundle.applicationType === 'EXPIRED_REGULAR';

  const typeLabel = bundle.applicationType
    ? APPLICATION_TYPE_LABELS[bundle.applicationType as ApplicationTypeEnum]?.title || bundle.applicationType
    : 'Semua Layanan';

  const dateStr = formatDate(bundle.createdAt || new Date(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const yearStr = new Date(bundle.createdAt || new Date()).getFullYear();

  const agendaNumber = React.useMemo(() => {
    if (!bundle.bundleId) return '001';
    const match = bundle.bundleId.match(/\/(\d+)-/);
    return match ? match[1] : '001';
  }, [bundle.bundleId]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-black print:bg-white print:p-0 font-sans">
      {/* SCREEN TOOLBAR */}
      <div className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Preview Surat Rekomendasi
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-semibold rounded-sm shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="py-8 px-4 flex flex-col items-center gap-8 print:p-0 print:gap-0">
        {/* ============================================================== */}
        {/* HALAMAN 1: PORTRAIT (SURAT PENGANTAR REKOMENDASI DINAS)       */}
        {/* ============================================================== */}
        <div className="sheet-portrait bg-white text-black shadow-md print:shadow-none mx-auto w-[210mm] min-h-[297mm] px-[12mm] py-[14mm] flex flex-col justify-between text-[10.5pt] leading-normal font-sans">
          <div>
            {/* KOP SURAT */}
            <div className="flex items-center gap-4 pb-2">
              <div className="w-[78px] shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo_kabupatentangerang.png"
                  alt="Logo Kabupaten Tangerang"
                  className="w-[74px] h-auto object-contain"
                />
              </div>
              <div className="flex-1 text-center leading-tight">
                <h2 className="text-[12.5pt] font-bold uppercase tracking-wider text-black">
                  PEMERINTAH KABUPATEN TANGERANG
                </h2>
                <h1 className="text-[15pt] font-bold uppercase tracking-wide text-black mt-0.5 mb-1">
                  BADAN PENDAPATAN DAERAH
                </h1>
                <p className="text-[9.5pt] font-normal leading-snug text-black">
                  Gedung Pendapatan Daerah Komp. Perkantoran Tigaraksa<br />
                  Telp. (021) 599 88333 Fax. (021) 599 88333<br />
                  Website: bapendatangerangkab.go.id Email : bapenda@tangerangkab.go.id
                </p>
              </div>
            </div>
            {/* GARIS PEMBATAS TEBAL TUNGGAL */}
            <div className="border-b-[2.5px] border-black mb-5" />

            {/* METADATA SURAT */}
            <div className="flex justify-between items-start text-[10pt] mb-6">
              <table className="w-[62%] text-left border-collapse">
                <tbody>
                  <tr>
                    <td className="w-18 align-top py-0.5">Nomor</td>
                    <td className="w-3 align-top py-0.5">:</td>
                    <td className="align-top py-0.5 font-normal">{bundle.bundleId}</td>
                  </tr>
                  <tr>
                    <td className="align-top py-0.5">Lampiran</td>
                    <td className="align-top py-0.5">:</td>
                    <td className="align-top py-0.5 font-normal">{bundle.applications?.length || 0} Berkas</td>
                  </tr>
                  <tr>
                    <td className="align-top py-0.5">Hal</td>
                    <td className="align-top py-0.5">:</td>
                    <td className="align-top py-0.5 font-normal">
                      Rekomendasi Permohonan {typeLabel} SPPT Tahun {yearStr}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="w-[36%] text-right text-[10pt]">
                <p>Tigaraksa, {dateStr}</p>
              </div>
            </div>

            {/* TUJUAN SURAT */}
            <div className="text-[10pt] mb-5 leading-relaxed">
              <p>Yth. Kepala Badan Pendapatan Daerah</p>
              <p>Cq. Kepala Bidang Pendataan, Penilaian, dan Penetapan Pajak Daerah</p>
              <p>di</p>
              <p>Tempat</p>
            </div>

            {/* PARAGRAF PEMBUKA */}
            <div className="text-[10pt] text-left space-y-4 leading-relaxed">
              <p>
                Dipermaklumkan dengan hormat, bersama ini kami sampaikan data permohonan {typeLabel} SPPT PBB Tahun {yearStr} pada pelayanan tatap muka UPTD Wilayah IV sebagai berikut:
              </p>

              {/* TABEL RINGKASAN EKSEKUTIF */}
              <div className="my-3">
                <table className="w-full border-collapse border-[1.5px] border-black text-center text-[9.5pt]">
                  <thead>
                    <tr className="font-bold">
                      <th className="border-[1.5px] border-black py-2 px-3 w-[18%]">NO AGENDA</th>
                      <th className="border-[1.5px] border-black py-2 px-3">JENIS</th>
                      <th className="border-[1.5px] border-black py-2 px-3 w-[20%]">JUMLAH</th>
                      <th className="border-[1.5px] border-black py-2 px-3 w-[30%]">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-[1.5px] border-black py-2.5 px-3">{agendaNumber}</td>
                      <td className="border-[1.5px] border-black py-2.5 px-3">{typeLabel}</td>
                      <td className="border-[1.5px] border-black py-2.5 px-3">{bundle.applications?.length || 0} Berkas</td>
                      <td className="border-[1.5px] border-black py-2.5 px-3">Rincian Berkas Terlampir</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PARAGRAF PENUTUP */}
              <p>
                Sehubungan dengan hal ini, bahwa berkas permohonan {typeLabel} SPPT PBB tersebut sudah melalui proses penelitian/verifikasi dan diarsipkan sebagaimana mestinya (data terlampir).
              </p>

              <p>
                Demikian surat rekomendasi ini kami sampaikan, atas perhatiannya diucapkan terimakasih.
              </p>
            </div>
          </div>

          {/* TANDA TANGAN HALAMAN 1 */}
          <div className="mt-8 flex justify-end">
            <div className="w-[42%] text-center text-[10pt] leading-snug">
              <p>Kepala UPTD</p>
              <p>Pajak Daerah Wilayah IV</p>

              <div className="h-20" />

              <p className="font-bold">
                ASEP SUANDI, SH., M.Si
              </p>
              <p className="text-[9.5pt]">
                NIP. 19800630 200801 1 006
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* HALAMAN 2: LANDSCAPE (LAMPIRAN DATA NOMINATIF)                 */}
        {/* ============================================================== */}
        <div className="sheet-landscape bg-white text-black shadow-md print:shadow-none mx-auto w-[297mm] min-h-[210mm] px-[4mm] py-[6mm] flex flex-col justify-between font-sans">
          <div>
            {/* HEADER LAMPIRAN */}
            {isMutasiHabis ? (
              <div className="text-[9.5pt] mb-2 leading-snug text-left">
                <p>Lampiran</p>
                <div className="flex">
                  <span className="w-28 inline-block">Nomor Pengantar</span>
                  <span>: {bundle.bundleId}</span>
                </div>
                <div className="flex">
                  <span className="w-28 inline-block">Tanggal</span>
                  <span>: {dateStr}</span>
                </div>
              </div>
            ) : (
              <div className="text-[9.5pt] mb-2 leading-snug text-left">
                <div className="flex">
                  <span className="w-16 inline-block">Nomor</span>
                  <span>: {bundle.bundleId}</span>
                </div>
                <div className="flex">
                  <span className="w-16 inline-block">Tanggal</span>
                  <span>: {dateStr}</span>
                </div>
              </div>
            )}

            {/* TABEL DATA NOMINATIF */}
            {isMutasiHabis ? (
              /* TABEL SP_Hal_2_MH (MUTASI HABIS / EXPIRED_UPDATE) */
              <div className="w-full">
                <table className="w-full table-fixed border-collapse border border-black text-[7pt] text-center leading-tight">
                  <colgroup>
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '2.5%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '8.5%' }} />
                  </colgroup>
                  <thead>
                    <tr className="font-bold text-[7pt]">
                      <th rowSpan={2} className="border border-black py-1 px-0.5">NO</th>
                      <th rowSpan={2} className="border border-black py-1 px-0.5">NOPEL</th>
                      <th colSpan={2} className="border border-black py-1 px-0.5">NO BUNDEL FORMULIR</th>
                      <th rowSpan={2} className="border border-black py-1 px-0.5">NOP</th>
                      <th rowSpan={2} className="border border-black py-1 px-0.5">WP<br />LAMA</th>
                      <th rowSpan={2} className="border border-black py-1 px-0.5">WP<br />BARU</th>
                      <th colSpan={4} className="border border-black py-1 px-0.5">Letak Objek Saat Ini</th>
                      <th colSpan={4} className="border border-black py-1 px-0.5">Letak Objek Seharusnya</th>
                      <th colSpan={2} className="border border-black py-1 px-0.5">Luas Tanah</th>
                      <th colSpan={2} className="border border-black py-1 px-0.5">Luas Bangunan</th>
                      <th rowSpan={2} className="border border-black py-1 px-0.5">Kepemilikan</th>
                    </tr>
                    <tr className="font-bold text-[6pt]">
                      <th className="border border-black py-0.5 px-0.5">Bumi</th>
                      <th className="border border-black py-0.5 px-0.5">Bangunan</th>
                      <th className="border border-black py-0.5 px-0.5">Nama Jalan</th>
                      <th className="border border-black py-0.5 px-0.5 leading-tight">Blok/<br />Kav/No</th>
                      <th className="border border-black py-0.5 px-0.5">RT</th>
                      <th className="border border-black py-0.5 px-0.5">RW</th>
                      <th className="border border-black py-0.5 px-0.5">Nama Jalan</th>
                      <th className="border border-black py-0.5 px-0.5 leading-tight">Blok/<br />Kav/No</th>
                      <th className="border border-black py-0.5 px-0.5">RT</th>
                      <th className="border border-black py-0.5 px-0.5">RW</th>
                      <th className="border border-black py-0.5 px-0.5">Saat ini</th>
                      <th className="border border-black py-0.5 px-0.5">Seharusnya</th>
                      <th className="border border-black py-0.5 px-0.5">Saat ini</th>
                      <th className="border border-black py-0.5 px-0.5">Seharusnya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.applications?.map((app: any, idx: number) => {
                      const prevData = app.complementary?.[0];
                      const prevSubject = prevData?.taxSubjectData;
                      const prevObject = prevData?.taxObjectData;
                      const curSubject = app.taxSubject;
                      const curObject = app.taxObject;

                      const nopDigits = (curObject?.nop || app.requestedNop || prevObject?.nop || '').replace(/\D/g, '');

                      const prevLT = prevObject?.landArea ?? null;
                      const newLT = curObject?.landArea ?? null;
                      const prevLB = prevObject?.buildingArea ?? null;
                      const newLB = curObject?.buildingArea ?? null;

                      return (
                        <tr key={app.id || idx}>
                          <td className="border border-black py-1 px-0.5">{idx + 1}</td>
                          <td className="border border-black py-1 px-0.5 text-center break-all text-[6.5pt]">
                            {app.smartgovId || app.applicationId || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {app.formNumbers?.noBumi ?? idx + 1}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {app.formNumbers?.noBangunan ?? ''}
                          </td>
                          <td className="border border-black py-1 px-0.5 font-mono text-[6.5pt] break-all">
                            {nopDigits || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {prevSubject?.name || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {curSubject?.name || '-'}
                          </td>

                          {/* LETAK SAAT INI */}
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {prevObject?.address || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5 break-words">
                            {prevObject?.block || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {prevObject?.neighborhoodUnit || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {prevObject?.communityUnit || ''}
                          </td>

                          {/* LETAK SEHARUSNYA */}
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {curObject?.address || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5 break-words">
                            {curObject?.block || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {curObject?.neighborhoodUnit || ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {curObject?.communityUnit || ''}
                          </td>

                          {/* LUAS TANAH */}
                          <td className="border border-black py-1 px-0.5">
                            {prevLT !== null ? prevLT : ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {newLT !== null ? newLT : ''}
                          </td>

                          {/* LUAS BANGUNAN */}
                          <td className="border border-black py-1 px-0.5">
                            {prevLB !== null ? prevLB : ''}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {newLB !== null ? newLB : ''}
                          </td>

                          {/* KEPEMILIKAN */}
                          <td className="border border-black py-1 px-0.5 text-left text-[6.5pt] break-words">
                            {curObject?.certificate || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABEL SP_Hal_2 (SELAIN MUTASI HABIS) */
              <div className="w-full">
                <table className="w-full table-fixed border-collapse border border-black text-[7.5pt] text-center leading-tight">
                  <colgroup>
                    <col style={{ width: '3%' }} />
                    <col style={{ width: '8.5%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '9.5%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '6%' }} />
                  </colgroup>
                  <thead>
                    <tr className="font-bold text-[7.5pt]">
                      <th className="border border-black py-1.5 px-0.5">NO</th>
                      <th className="border border-black py-1.5 px-0.5">NOPEL</th>
                      <th className="border border-black py-1.5 px-0.5">NOP</th>
                      <th className="border border-black py-1.5 px-1 text-left">NAMA PEMOHON</th>
                      <th className="border border-black py-1.5 px-1 text-left">NAMA SPPT</th>
                      <th className="border border-black py-1.5 px-1 text-left">ALAMAT OP</th>
                      <th className="border border-black py-1.5 px-0.5 text-left">DESA</th>
                      <th className="border border-black py-1.5 px-0.5 text-left">KEC</th>
                      <th className="border border-black py-1.5 px-0.5 text-left">JENIS</th>
                      <th className="border border-black py-1.5 px-0.5">LT</th>
                      <th className="border border-black py-1.5 px-0.5">LB</th>
                      <th className="border border-black py-1.5 px-0.5 text-left">BUKTI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.applications?.map((app: any, idx: number) => {
                      const prevData = app.complementary?.[0];
                      const prevSubject = prevData?.taxSubjectData;
                      const curSubject = app.taxSubject;
                      const curObject = app.taxObject;

                      const nopDigits = (curObject?.nop || app.requestedNop || '').replace(/\D/g, '');

                      const fullAlamat = [
                        curObject?.address,
                        curObject?.block ? `Blok ${curObject.block}` : null,
                        curObject?.neighborhoodUnit || curObject?.communityUnit
                          ? `Rt ${curObject?.neighborhoodUnit || '-'}/rw ${curObject?.communityUnit || '-'}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(', ');

                      return (
                        <tr key={app.id || idx}>
                          <td className="border border-black py-1 px-0.5">{idx + 1}</td>
                          <td className="border border-black py-1 px-0.5 text-left break-all text-[7pt]">
                            {app.smartgovId || app.applicationId || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 font-mono text-[7pt] break-all text-left">
                            {nopDigits || '-'}
                          </td>
                          <td className="border border-black py-1 px-1 text-left break-words">
                            {curSubject?.name || '-'}
                          </td>
                          <td className="border border-black py-1 px-1 text-left break-words">
                            {prevSubject?.name || '-'}
                          </td>
                          <td className="border border-black py-1 px-1 text-left break-words">
                            {fullAlamat || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {curObject?.village || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {curObject?.subdistrict || '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left break-words">
                            {typeLabel}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {curObject?.landArea ?? '-'}
                          </td>
                          <td className="border border-black py-1 px-0.5">
                            {curObject?.buildingArea ?? '0'}
                          </td>
                          <td className="border border-black py-1 px-0.5 text-left text-[7pt] break-words">
                            {curObject?.certificate || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TANDA TANGAN HALAMAN 2 */}
          <div className="mt-6 flex justify-end">
            <div className="w-[30%] text-center text-[9.5pt] leading-snug">
              {isMutasiHabis ? (
                <>
                  <p className="font-bold uppercase tracking-wider text-[8.5pt]">
                    KEPALA UNIT PELAKSANA TEKNIS
                  </p>
                  <p className="font-bold uppercase tracking-wider text-[8.5pt]">
                    PAJAK DAERAH WILAYAH IV
                  </p>
                </>
              ) : (
                <>
                  <p>Kepala UPTD</p>
                  <p>Pajak Daerah Wilayah IV</p>
                </>
              )}

              <div className="h-16" />

              <p className="font-bold">
                ASEP SUANDI, SH., M.Si
              </p>
              <p className="text-[9pt]">
                NIP. 19800630 200801 1 006
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT CSS STYLES */}
      <style jsx global>{`
        @media print {
          @page portrait-sheet {
            size: A4 portrait;
            margin: 12mm;
          }
          @page landscape-sheet {
            size: A4 landscape;
            margin: 4mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .sheet-portrait {
            page: portrait-sheet;
            page-break-after: always;
            break-after: page;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
          }
          .sheet-landscape {
            page: landscape-sheet;
            page-break-before: always;
            break-before: page;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
