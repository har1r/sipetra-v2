'use client';

import React, { useState } from 'react';
import { BundleDataTable, BundleItem } from '@/components/shared/tables/BundleDataTable';
import { SubmitBundleModal } from './SubmitBundleModal';
import { Printer, Send, Copy, MoreVertical } from 'lucide-react';
import { KtuBundleItem } from '@/features/head-of-administrative-office/schemas/bundle.schema';

interface VerificatorBundleTableProps {
  bundles: BundleItem[];
}

export function VerificatorBundleTable({ bundles }: VerificatorBundleTableProps) {
  const [selectedBundleForSubmit, setSelectedBundleForSubmit] = useState<KtuBundleItem | null>(null);

  const handleCopyBundleId = (bundleId: string, closeMenu: () => void) => {
    navigator.clipboard.writeText(bundleId);
    closeMenu();
  };

  const renderCardFooter = (bundle: BundleItem) => {
    const appCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;
    const verifyingCount = bundle.applications?.filter((a) => a.status === 'VERIFYING').length ?? 0;
    const isAwaitingKtu = appCount > 0 && bundle.applications?.every((a) => a.status === 'ADMINISTRATIVE_OFFICE_HEAD_APPROVING');
    const isBeyondKtu = appCount > 0 && bundle.applications?.every((a) => a.status !== 'VERIFYING' && a.status !== 'ADMINISTRATIVE_OFFICE_HEAD_APPROVING');
    const canSubmit = verifyingCount > 0;

    if (canSubmit) {
      return (
        <button
          type="button"
          onClick={() => setSelectedBundleForSubmit(bundle as unknown as KtuBundleItem)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ajukan ke KTU ({verifyingCount})</span>
        </button>
      );
    }

    if (isAwaitingKtu) {
      return (
        <div className="w-full py-1 text-center bg-purple-50 border border-purple-200/80 rounded-sm text-[11px] font-bold text-purple-700">
          Menunggu Paraf KTU
        </div>
      );
    }

    if (isBeyondKtu) {
      return (
        <div className="w-full py-1 text-center bg-emerald-50 border border-emerald-200/80 rounded-sm text-[11px] font-bold text-emerald-700">
          Diproses / Selesai
        </div>
      );
    }

    return (
      <div className="w-full py-1 text-center bg-slate-50 border border-slate-200/80 rounded-sm text-[11px] font-medium text-slate-400 italic">
        Belum Ada Berkas
      </div>
    );
  };

  const renderActions = (bundle: BundleItem, closeMenu: () => void) => {
    const verifyingCount = bundle.applications?.filter((a) => a.status === 'VERIFYING').length ?? 0;
    const canSubmit = verifyingCount > 0;

    return (
      <>
        <a
          href={`/preview/bundle/${bundle.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cetak Rekomendasi</span>
        </a>

        <button
          type="button"
          onClick={() => {
            closeMenu();
            setSelectedBundleForSubmit(bundle as unknown as KtuBundleItem);
          }}
          disabled={!canSubmit}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left border-t border-slate-100 ${
            canSubmit
              ? 'text-[#00a389] hover:bg-slate-50'
              : 'text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-[#00a389]" />
          <span>Ajukan ke KTU</span>
        </button>

        <button
          type="button"
          onClick={() => handleCopyBundleId(bundle.bundleId, closeMenu)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left border-t border-slate-100"
        >
          <Copy className="w-3.5 h-3.5 text-slate-600" />
          <span>Salin ID Bundle</span>
        </button>
      </>
    );
  };

  const renderTableRowActions = (
    bundle: BundleItem,
    closeMenu: () => void,
    isMenuOpen: boolean,
    toggleMenu: () => void
  ) => {
    const appCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;
    const verifyingCount = bundle.applications?.filter((a) => a.status === 'VERIFYING').length ?? 0;
    const isAwaitingKtu = appCount > 0 && bundle.applications?.every((a) => a.status === 'ADMINISTRATIVE_OFFICE_HEAD_APPROVING');
    const canSubmit = verifyingCount > 0;

    return (
      <div className="flex items-center justify-center gap-1.5">
        {canSubmit && (
          <button
            type="button"
            onClick={() => setSelectedBundleForSubmit(bundle as unknown as KtuBundleItem)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00a389] hover:bg-[#008670] text-white text-[11px] font-semibold rounded-xs shadow-2xs transition-colors cursor-pointer"
            title="Ajukan Bundle ke KTU"
          >
            <Send className="w-3 h-3" />
            <span>Ajukan</span>
          </button>
        )}
        {isAwaitingKtu && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Menunggu KTU
          </span>
        )}

        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={toggleMenu}
            className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeMenu} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                {renderActions(bundle, closeMenu)}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <BundleDataTable
        bundles={bundles}
        renderCardFooter={renderCardFooter}
        renderActions={renderActions}
        renderTableRowActions={renderTableRowActions}
      />

      <SubmitBundleModal
        bundle={selectedBundleForSubmit}
        isOpen={!!selectedBundleForSubmit}
        onClose={() => setSelectedBundleForSubmit(null)}
      />
    </>
  );
}
