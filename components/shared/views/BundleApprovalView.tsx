'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  FileWarning,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  Download,
  Search,
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum, getApplicationStatusInfo } from '@/features/front-officer/schemas/application.schema';
import { approveByheadOfAdministrativeOfficer } from '@/features/head-of-administrative-office/actions/bundle.actions';
import { signByHeadOfOffice } from '@/features/head-of-office/actions/bundle.actions';

export interface BundleApprovalApplicationItem {
  id: string;
  applicationId: string;
  applicationType: ApplicationTypeEnum;
  status: string;
  requestedNop?: string | null;
  smartgovId?: string | null;
  files: string[];
  createdAt: Date | string;
  taxSubject?: {
    name?: string;
    whatsappNumber?: string;
    address?: string;
  };
  taxObject?: {
    nop?: string;
    address?: string;
    landArea?: number | null;
    buildingArea?: number | null;
  };
}

export interface BundleApprovalViewProps {
  bundle: {
    id: string;
    bundleId: string;
    applicationType?: ApplicationTypeEnum | null;
    createdAt: Date | string;
    createdBy?: {
      name?: string | null;
      email?: string | null;
    } | null;
    applications: BundleApprovalApplicationItem[];
  };
  role?: 'HEAD_OF_ADMINISTRATIVE_OFFICE' | 'HEAD_OF_OFFICE';
  backUrl?: string;
  approveButtonText?: string;
  approvedBadgeText?: string;
  confirmMessage?: string;
  successMessage?: string;
}

export function BundleApprovalView({
  bundle,
  role = 'HEAD_OF_ADMINISTRATIVE_OFFICE',
  backUrl,
  approveButtonText,
  approvedBadgeText,
  confirmMessage,
  successMessage,
}: BundleApprovalViewProps) {
  const isKupt = role === 'HEAD_OF_OFFICE';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isInitiallyApproved = isKupt
    ? bundle.applications.length > 0 && bundle.applications.every((a) => a.status !== 'OFFICE_HEAD_APPROVING')
    : bundle.applications.length > 0 && bundle.applications.every((a) => a.status !== 'ADMINISTRATIVE_OFFICE_HEAD_APPROVING');

  const resolvedBackUrl = backUrl || (isKupt ? '/dashboard/workflow/ttd-kupt' : '/dashboard/workflow/paraf-ktu');
  const resolvedApproveBtn = approveButtonText || (isKupt ? 'Tanda Tangan Seluruh Berkas Bundle' : 'Paraf Seluruh Berkas Bundle');
  const resolvedBadgeText = approvedBadgeText || (isKupt ? 'Sudah Ditandatangani KUPT' : 'Sudah Diparaf KTU');
  const resolvedConfirmMsg = confirmMessage || (isKupt
    ? `Apakah Anda yakin ingin menandatangani keputusan berkas Bundle ${bundle.bundleId}? Status akan berubah menjadi Dalam Pengiriman.`
    : `Apakah Anda yakin ingin memberikan paraf persetujuan KTU untuk Bundle ${bundle.bundleId}? Berkas akan diteruskan ke KUPT.`);
  const resolvedSuccessMsg = successMessage || (isKupt
    ? `Tanda tangan KUPT untuk Bundle ${bundle.bundleId} berhasil disimpan.`
    : `Paraf KTU untuk Bundle ${bundle.bundleId} berhasil disimpan.`);

  const [selectedAppId, setSelectedAppId] = useState<string>(
    bundle.applications[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(isInitiallyApproved);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fileStatus, setFileStatus] = useState<'checking' | 'valid' | 'invalid' | 'none'>('checking');

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const selectedApp =
    bundle.applications.find((app) => app.id === selectedAppId) ||
    bundle.applications[0];

  const filteredApplications = React.useMemo(() => {
    if (!searchQuery.trim()) return bundle.applications;
    const q = searchQuery.toLowerCase().trim();
    return bundle.applications.filter((app) => {
      const appId = app.applicationId.toLowerCase();
      const name = app.taxSubject?.name?.toLowerCase() || '';
      const typeStr = app.applicationType.toLowerCase();
      return appId.includes(q) || name.includes(q) || typeStr.includes(q);
    });
  }, [bundle.applications, searchQuery]);

  // Filter out client-only temporary blob: URLs which cannot be read across sessions
  const validFiles = React.useMemo(() => {
    return (selectedApp?.files || []).filter(
      (f) => typeof f === 'string' && f.trim().length > 0 && !f.startsWith('blob:')
    );
  }, [selectedApp?.files]);

  const currentFileUrl = validFiles[activeFileIndex] || null;

  // Verifikasi ketersediaan berkas lampiran sebelum merender iframe untuk mencegah kemunculan halaman 404
  useEffect(() => {
    if (!currentFileUrl) {
      setFileStatus('none');
      return;
    }

    if (currentFileUrl.startsWith('data:') || currentFileUrl.startsWith('blob:')) {
      setFileStatus('valid');
      return;
    }

    let isCancelled = false;
    setFileStatus('checking');

    fetch(currentFileUrl, { method: 'HEAD' })
      .then((res) => {
        if (!isCancelled) {
          if (res.ok) {
            setFileStatus('valid');
          } else {
            setFileStatus('invalid');
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setFileStatus('invalid');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentFileUrl]);

  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    setActiveFileIndex(0);
  };

  const handleConfirmApproval = () => {
    if (isApproved || isPending) return;
    setShowConfirmModal(false);

    startTransition(async () => {
      try {
        const res = isKupt
          ? await signByHeadOfOffice(bundle.id)
          : await approveByheadOfAdministrativeOfficer(bundle.id);

        if (res.success) {
          setIsApproved(true);
          setFeedback({
            type: 'success',
            message: res.message || resolvedSuccessMsg,
          });
          router.refresh();
        } else {
          setFeedback({
            type: 'error',
            message: res.message || 'Gagal memproses berkas bundle.',
          });
        }
      } catch (err) {
        console.error('Approval action error:', err);
        setFeedback({
          type: 'error',
          message: 'Terjadi kesalahan sistem saat memproses persetujuan berkas.',
        });
      }
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* FEEDBACK TOAST / ALERT */}
      {feedback && (
        <div
          className={`p-3.5 rounded-sm border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white p-4 rounded-sm border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={resolvedBackUrl}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 rounded-sm transition-colors cursor-pointer"
            title="Kembali ke Daftar Bundle"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-base flex items-center gap-1.5">
                {bundle.bundleId}
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {resolvedBadgeText}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={isApproved || isPending}
            className={`inline-flex items-center gap-2 px-4 py-2 font-semibold text-xs rounded-sm shadow-xs transition-all cursor-pointer ${
              isApproved
                ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                : isPending
                ? 'bg-[#00a389]/70 text-white cursor-wait'
                : 'bg-[#00a389] hover:bg-[#008670] text-white'
            }`}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>
              {isPending
                ? 'Memproses...'
                : isApproved
                ? 'Selesai Diproses'
                : resolvedApproveBtn}
            </span>
          </button>
        </div>
      </div>

      {/* 2-PANEL WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* PANEL KIRI: DAFTAR PERMOHONAN */}
        <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 bg-white rounded-sm border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-210px)] min-h-[500px]">
          <div className="p-2.5 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Permohonan
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                {filteredApplications.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari permohonan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-8 pr-2.5 py-1 text-xs text-slate-800 outline-none focus:border-[#00a389] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <FileText className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs">Tidak ada data.</p>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const appTypeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                  code: app.applicationType,
                  title: app.applicationType,
                  badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const applicantName = app.taxSubject?.name || 'Nama Tidak Tersedia';

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectApp(app.id)}
                    className={`w-full text-left p-2.5 transition-all cursor-pointer flex flex-col gap-1 relative ${isSelected
                      ? 'bg-slate-50 border-l-4 border-[#00a389]'
                      : 'hover:bg-slate-50/70'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-900 text-xs tracking-tight truncate">
                        {app.applicationId}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold border shrink-0 ${appTypeInfo.badgeStyle}`}
                        title={appTypeInfo.title}
                      >
                        {appTypeInfo.code}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-600 truncate">
                      {applicantName}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-slate-500 font-medium">
                        {getApplicationStatusInfo(app.status).label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL KANAN: PREVIEW PDF / BERKAS LAMPIRAN */}
        <div className="flex-1 bg-white rounded-sm border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-210px)] min-h-[500px] overflow-hidden">
          {selectedApp ? (
            <>
              {/* TOP CONTROLS PANEL KANAN */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Paperclip className="w-3.5 h-3.5 text-[#00a389]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      Lampiran Berkas ({selectedApp.applicationId})
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Multi-file switcher jika berkas > 1 */}
                  {validFiles.length > 1 && (
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-sm border border-slate-200 text-xs">
                      {validFiles.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveFileIndex(idx)}
                          className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${activeFileIndex === idx
                            ? 'bg-[#00a389] text-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          Berkas #{idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentFileUrl && fileStatus === 'valid' && (
                    <div className="flex items-center gap-1">
                      <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-sm transition-colors"
                        title="Buka di tab baru"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span className="hidden sm:inline">Buka</span>
                      </a>
                      <a
                        href={currentFileUrl}
                        download={`Berkas-${selectedApp.applicationId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-sm transition-colors"
                        title="Unduh berkas"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* AREA PREVIEW DOKUMEN / PDF DENGAN FALLBACK & VALIDASI STATUS */}
              <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
                {fileStatus === 'checking' && (
                  <div className="p-8 text-center text-slate-400 space-y-2 m-auto">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00a389]" />
                    <p className="text-xs text-slate-500 font-medium">Memeriksa ketersediaan berkas...</p>
                  </div>
                )}

                {fileStatus === 'invalid' && (
                  <div className="p-10 text-center text-slate-400 space-y-3 m-auto max-w-md">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                      <FileWarning className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Berkas Lampiran Tidak Ditemukan</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Tautan berkas digital permohonan <span className="font-semibold text-slate-700 font-mono">{selectedApp.applicationId}</span> tidak ditemukan pada server penyimpanan (404 Not Found).
                      </p>
                    </div>
                    {currentFileUrl && (
                      <div className="pt-2">
                        <a
                          href={currentFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-sm transition-colors shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Coba Buka Tautan Berkas</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {fileStatus === 'none' && (
                  <div className="p-12 text-center text-slate-400 space-y-3 m-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-200/70 flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700">Belum Ada Lampiran Berkas</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Permohonan ini belum memiliki lampiran berkas digital (PDF/Gambar) yang diunggah.
                      </p>
                    </div>
                  </div>
                )}

                {fileStatus === 'valid' && currentFileUrl && (
                  currentFileUrl.endsWith('.png') ||
                  currentFileUrl.endsWith('.jpg') ||
                  currentFileUrl.endsWith('.jpeg') ||
                  currentFileUrl.startsWith('data:image/') ? (
                    <div className="w-full h-full p-4 overflow-auto flex items-center justify-center">
                      <img
                        src={currentFileUrl}
                        alt={`Berkas ${selectedApp.applicationId}`}
                        loading="lazy"
                        onError={() => setFileStatus('invalid')}
                        className="max-w-full max-h-full object-contain rounded-xs shadow-md border border-slate-200 bg-white"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={currentFileUrl}
                      loading="lazy"
                      className="w-full h-full border-0 bg-white"
                      title={`Preview PDF ${selectedApp.applicationId}`}
                    />
                  )
                )}
              </div>

              {fileStatus === 'valid' && currentFileUrl && (
                <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
                  Pratinjau berkas digital. Jika tidak tampil sempurna di peramban, gunakan tombol <span className="font-semibold text-slate-700">Buka</span> di atas.
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2 m-auto">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Pilih salah satu permohonan di panel kiri untuk melihat pratinjau berkas.</p>
            </div>
          )}
        </div>
      </div>

      {/* NON-BLOCKING CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-sm shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-[#00a389]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {isKupt ? 'Konfirmasi Tanda Tangan Bundle' : 'Konfirmasi Paraf Persetujuan Bundle'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {resolvedConfirmMsg}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isPending ? 'Memproses...' : 'Ya, Lanjutkan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
