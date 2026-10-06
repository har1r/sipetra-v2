'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  Download,
  Search,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';

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

  const resolvedBackUrl = backUrl || (isKupt ? '/dashboard/workflow/ttd-kupt' : '/dashboard/workflow/paraf-ktu');
  const resolvedApproveBtn = approveButtonText || (isKupt ? 'Tanda Tangan Seluruh Berkas Bundle' : 'Paraf Seluruh Berkas Bundle');
  const resolvedBadgeText = approvedBadgeText || (isKupt ? 'Sudah Ditandatangani KUPT' : 'Sudah Diparaf KTU');
  const resolvedConfirmMsg = confirmMessage || (isKupt
    ? `Apakah Anda yakin ingin menandatangani berkas Bundle ${bundle.bundleId}?`
    : `Apakah Anda yakin ingin memberikan paraf persetujuan KTU untuk Bundle ${bundle.bundleId}?`);
  const resolvedSuccessMsg = successMessage || (isKupt
    ? `Tanda tangan KUPT untuk Bundle ${bundle.bundleId} berhasil disimpan.`
    : `Paraf KTU untuk Bundle ${bundle.bundleId} berhasil disimpan.`);

  const [selectedAppId, setSelectedAppId] = useState<string>(
    bundle.applications[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

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

  const typeInfo = bundle.applicationType
    ? APPLICATION_TYPE_UI[bundle.applicationType as ApplicationTypeEnum] || {
      code: bundle.applicationType,
      title: bundle.applicationType,
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    : null;

  // Filter out client-only temporary blob: URLs which cannot be read across sessions
  const validFiles = React.useMemo(() => {
    return (selectedApp?.files || []).filter(
      (f) => typeof f === 'string' && f.trim().length > 0 && !f.startsWith('blob:')
    );
  }, [selectedApp?.files]);

  const currentFileUrl = validFiles[activeFileIndex] || null;

  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    setActiveFileIndex(0);
  };

  const handleApprovalAction = () => {
    if (window.confirm(resolvedConfirmMsg)) {
      setIsApproved(true);
      alert(resolvedSuccessMsg);
    }
  };

  return (
    <div className="space-y-4 pb-12">
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
            onClick={handleApprovalAction}
            className={`inline-flex items-center gap-2 px-4 py-2 font-semibold text-xs rounded-sm shadow-xs transition-all cursor-pointer ${isApproved
              ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
              : 'bg-[#00a389] hover:bg-[#008670] text-white'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isApproved ? 'Selesai Diproses' : resolvedApproveBtn}</span>
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
                      Lampiran Berkas
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

                  {currentFileUrl && (
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

              {/* AREA PREVIEW DOKUMEN / PDF */}
              <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
                {currentFileUrl ? (
                  currentFileUrl.endsWith('.png') ||
                    currentFileUrl.endsWith('.jpg') ||
                    currentFileUrl.endsWith('.jpeg') ||
                    currentFileUrl.startsWith('data:image/') ? (
                    <div className="w-full h-full p-4 overflow-auto flex items-center justify-center">
                      <img
                        src={currentFileUrl}
                        alt={`Berkas ${selectedApp.applicationId}`}
                        className="max-w-full max-h-full object-contain rounded-xs shadow-md border border-slate-200 bg-white"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={currentFileUrl}
                      className="w-full h-full border-0 bg-white"
                      title={`Preview PDF ${selectedApp.applicationId}`}
                    />
                  )
                ) : (
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
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2 m-auto">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Pilih salah satu permohonan di panel kiri untuk melihat pratinjau berkas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
