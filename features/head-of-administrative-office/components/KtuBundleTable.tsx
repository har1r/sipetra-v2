'use client';

import React from 'react';
import Link from 'next/link';
import { BundleDataTable, BundleItem } from '@/components/shared/tables/BundleDataTable';
import { Printer, PenTool, Copy, MoreVertical, CheckCircle2 } from 'lucide-react';

interface KtuBundleTableProps {
  bundles: BundleItem[];
}

function isBundleApprovedByKtu(bundle: BundleItem): boolean {
  const apps = bundle.applications || [];
  return apps.length > 0 && apps.every((app) => app.status !== 'ADMINISTRATIVE_OFFICE_HEAD_APPROVING');
}

export function KtuBundleTable({ bundles }: KtuBundleTableProps) {
  const handleCopyBundleId = (bundleId: string, closeMenu: () => void) => {
    navigator.clipboard.writeText(bundleId);
    closeMenu();
  };

  const renderCardFooter = (bundle: BundleItem) => {
    const isApproved = isBundleApprovedByKtu(bundle);

    if (isApproved) {
      return (
        <Link
          href={`/dashboard/workflow/paraf-ktu/${bundle.id}/approval`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-sm transition-colors shadow-2xs cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sudah Diparaf KTU (Tinjau)</span>
        </Link>
      );
    }

    return (
      <Link
        href={`/dashboard/workflow/paraf-ktu/${bundle.id}/approval`}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer"
      >
        <PenTool className="w-3.5 h-3.5" />
        <span>Tinjau & Paraf Berkas</span>
      </Link>
    );
  };

  const renderActions = (bundle: BundleItem, closeMenu: () => void) => {
    const isApproved = isBundleApprovedByKtu(bundle);

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

        <Link
          href={`/dashboard/workflow/paraf-ktu/${bundle.id}/approval`}
          onClick={closeMenu}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left border-t border-slate-100"
        >
          {isApproved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <PenTool className="w-3.5 h-3.5 text-[#00a389]" />
          )}
          <span>{isApproved ? 'Tinjau Berkas Diparaf' : 'Paraf Permohonan'}</span>
        </Link>

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
    const isApproved = isBundleApprovedByKtu(bundle);

    return (
      <div className="flex items-center justify-center gap-1.5">
        <Link
          href={`/dashboard/workflow/paraf-ktu/${bundle.id}/approval`}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xs shadow-2xs transition-colors cursor-pointer ${
            isApproved
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-[#00a389] hover:bg-[#008670] text-white'
          }`}
          title={isApproved ? 'Sudah Diparaf KTU (Tinjau)' : 'Paraf Permohonan'}
        >
          {isApproved ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <PenTool className="w-3 h-3" />
          )}
          <span>{isApproved ? 'Diparaf' : 'Paraf'}</span>
        </Link>

        <div className="relative inline-block text-left" data-bundle-menu="true">
          <button
            type="button"
            onClick={toggleMenu}
            className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
              {renderActions(bundle, closeMenu)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <BundleDataTable
      bundles={bundles}
      renderCardFooter={renderCardFooter}
      renderActions={renderActions}
      renderTableRowActions={renderTableRowActions}
    />
  );
}
