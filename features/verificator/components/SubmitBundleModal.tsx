'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Send,
  Loader2,
  AlertCircle,
  Layers,
  Package,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { KtuBundleItem } from '@/features/head-of-administrative-office/schemas/bundle.schema';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';
import { submitBundleToKtu } from '../actions/bundle.actions';

interface SubmitBundleModalProps {
  bundle: KtuBundleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubmitBundleModal({
  bundle,
  isOpen,
  onClose,
  onSuccess,
}: SubmitBundleModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !bundle) return null;

  const verifyingApps = bundle.applications?.filter((a) => a.status === 'VERIFYING') ?? [];
  const verifyingCount = verifyingApps.length;
  const totalCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;

  const typeInfo = bundle.applicationType
    ? APPLICATION_TYPE_UI[bundle.applicationType as ApplicationTypeEnum] || {
        code: bundle.applicationType,
        title: bundle.applicationType,
        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
      }
    : null;

  const handleSubmit = () => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitBundleToKtu(bundle.id);
      if (res.success) {
        onSuccess?.();
        onClose();
        router.refresh();
      } else {
        setServerError(res.message || 'Gagal mengajukan bundle ke KTU.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={!isPending ? onClose : undefined} />

      <div className="relative bg-white rounded-md shadow-2xl max-w-md w-full my-6 overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00a389]/10 text-[#00a389] rounded-sm">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Ajukan Bundle ke KTU
              </h3>
              <p className="text-[11px] text-slate-500">
                Teruskan berkas telaah yang telah selesai diverifikasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/80 rounded-sm p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Nomor Bundle</span>
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                {bundle.bundleId}
              </span>
            </div>

            {typeInfo && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Jenis Pelayanan</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold border ${typeInfo.badgeStyle}`}>
                  {typeInfo.title}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Berkas Siap Diajukan</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#00a389] bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-sm text-xs">
                <Package className="w-3.5 h-3.5 text-[#00a389]" />
                {verifyingCount} dari {totalCount} Permohonan
              </span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-sm p-3 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1 text-[11px]">
              <span>Perubahan Status Workflow:</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-white/80 p-2 rounded-xs border border-amber-200/60">
              <span className="text-amber-700">Dalam Verifikasi</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-purple-700 font-bold">Menunggu Paraf KTU</span>
            </div>
            <p className="text-[10px] text-amber-800/90 leading-relaxed">
              Semua permohonan dalam bundle ini akan diteruskan ke antrean kerja Kepala Tata Usaha (KTU) untuk proses paraf.
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || verifyingCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ajukan ke KTU</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
