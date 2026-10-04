'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  LayoutList,
  Table as TableIcon,
  Download,
  Layers,
  Copy,
  MoreVertical,
  X,
  FileText,
  Package,
  User,
  PenTool,
} from 'lucide-react';
import { KtuBundleItem } from '@/features/head-of-administrative-office/schemas/bundle.schema';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';
import { formatShortDate } from '@/lib/utils';

export interface BundleDataTableProps {
  bundles: KtuBundleItem[];
  role?: 'HEAD_OF_ADMINISTRATIVE_OFFICE' | 'HEAD_OF_OFFICE' | 'VERIFICATOR';
}

export function BundleDataTable({ bundles, role = 'HEAD_OF_ADMINISTRATIVE_OFFICE' }: BundleDataTableProps) {
  const isKupt = role === 'HEAD_OF_OFFICE';
  const isVerificator = role === 'VERIFICATOR';
  const approvalUrl = (id: string) => isKupt ? `/dashboard/workflow/ttd-kupt/${id}/approval` : `/dashboard/workflow/paraf-ktu/${id}/approval`;
  const actionLabel = isKupt ? 'Tanda Tangan Permohonan' : 'Paraf Permohonan';

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const typeOptions = [
    { key: 'ALL', label: 'Semua Jenis' },
    { key: 'PARTIAL_MUTATION', label: 'Mutasi Sebagian' },
    { key: 'EXPIRED_UPDATE', label: 'Mutasi Habis Update' },
    { key: 'EXPIRED_REGULAR', label: 'Mutasi Habis Reguler' },
    { key: 'NEW_TAX_OBJECT', label: 'Objek Pajak Baru' },
    { key: 'CORRECTION', label: 'Pembetulan' },
    { key: 'REACTIVATION', label: 'Pengaktifan' },
    { key: 'MERGER_MUTATION', label: 'Mutasi Penggabungan' },
    { key: 'MERGER_AND_PARTIAL_MUTATION', label: 'Mutasi Penggabungan & Pemecahan' },
  ];

  const filteredBundles = React.useMemo(() => {
    return bundles.filter((bundle) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const bId = bundle.bundleId?.toLowerCase() || '';
        const creator = bundle.createdBy?.name?.toLowerCase() || '';
        const typeStr = bundle.applicationType?.toLowerCase() || '';
        if (!bId.includes(q) && !creator.includes(q) && !typeStr.includes(q)) {
          return false;
        }
      }

      if (selectedType !== 'ALL' && bundle.applicationType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [bundles, searchQuery, selectedType]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedType !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
  };

  const getDateParts = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return { day: '-', month: '-' };
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return { day: '-', month: '-' };
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('id-ID', { month: 'short' }),
    };
  };

  const handleCopyBundleId = (bundleId: string) => {
    navigator.clipboard.writeText(bundleId);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR CONTROL BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-sm px-2.5 py-1 text-xs gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID Bundle, Jenis, Pembuat..."
                className="bg-transparent border-none outline-none text-slate-800 text-xs w-48 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-500 rounded-sm transition-all cursor-pointer"
              title="Cari bundle"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-sm px-2 py-1 text-xs font-semibold text-slate-700 gap-1">
            <button type="button" className="p-1 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Oktober 2026</span>
            </div>
            <button type="button" className="p-1 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                hasActiveFilters || isFilterOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#00a389] shrink-0" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200/90 rounded-sm shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                    Jenis Permohonan (Application Type)
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[240px] overflow-y-auto pr-1 scrollbar-none">
                    {typeOptions.map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setSelectedType(type.key)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer text-left ${
                          selectedType === type.key
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{type.label}</span>
                        {selectedType === type.key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a389] shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                  <span className="text-[11px] font-medium text-slate-400">
                    {filteredBundles.length} bundle
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <div className="flex items-center p-1 bg-slate-100/80 rounded-sm border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutList className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export to csv
          </button>
        </div>
      </div>

      {/* CONTENT DATA WORKSPACE */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            {hasActiveFilters ? 'Tidak Ada Bundle Ditemukan' : 'Belum Ada Bundle Telaah'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Tidak ada data bundle yang sesuai dengan filter atau kata kunci yang dipilih.'
              : 'Belum ada bundle berkas telaah yang diajukan oleh tim verifikator.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* MODE KARTU */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBundles.map((bundle) => {
            const dateParts = getDateParts(bundle.createdAt);
            const appCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;
            const typeInfo = bundle.applicationType
              ? APPLICATION_TYPE_UI[bundle.applicationType as ApplicationTypeEnum] || {
                  code: bundle.applicationType,
                  title: bundle.applicationType,
                  badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                }
              : null;

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-sm border border-slate-200/80 hover:border-slate-300 transition-all p-4 shadow-xs hover:shadow-sm flex flex-col justify-between gap-3 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm tracking-tight block">
                        {bundle.bundleId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Dibuat: {dateParts.day} {dateParts.month}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === bundle.id ? null : bundle.id)}
                      className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === bundle.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                          {!isVerificator && (
                            <Link
                              href={approvalUrl(bundle.id)}
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                            >
                              <PenTool className="w-3.5 h-3.5 text-[#00a389]" />
                              <span>{actionLabel}</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyBundleId(bundle.bundleId)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left ${!isVerificator ? 'border-t border-slate-100' : ''}`}
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Salin ID Bundle</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Jenis Pelayanan</span>
                    {typeInfo ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold border ${typeInfo.badgeStyle}`}
                        title={typeInfo.title}
                      >
                        {typeInfo.title}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Belum ditentukan</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Jumlah Berkas</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-sm text-[11px]">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      {appCount} Permohonan
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Verifikator</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      {bundle.createdBy?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE TABEL */
        <div className="bg-white rounded-sm border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 border-b border-slate-200/80">
                  <th className="py-2.5 px-3 whitespace-nowrap text-center w-10">No.</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">ID Bundle</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Jenis Permohonan</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Jumlah Berkas</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Verifikator Pembuat</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Tgl. Dibuat</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
                {filteredBundles.map((bundle, index) => {
                  const appCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;
                  const typeInfo = bundle.applicationType
                    ? APPLICATION_TYPE_UI[bundle.applicationType as ApplicationTypeEnum] || {
                        code: bundle.applicationType,
                        title: bundle.applicationType,
                        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                      }
                    : null;

                  return (
                    <tr key={bundle.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-center font-semibold text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 text-[11px]">
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {bundle.bundleId}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {typeInfo ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold border ${typeInfo.badgeStyle}`}
                            title={typeInfo.title}
                          >
                            {typeInfo.title}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-sm text-[11px]">
                          <Package className="w-3 h-3 text-slate-500" />
                          {appCount} Berkas
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700">
                        {bundle.createdBy?.name || '-'}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600">
                        {formatShortDate(bundle.createdAt)}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === bundle.id ? null : bundle.id)}
                            className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === bundle.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                {!isVerificator && (
                                  <Link
                                    href={approvalUrl(bundle.id)}
                                    onClick={() => setOpenMenuId(null)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                                  >
                                    <PenTool className="w-3.5 h-3.5 text-[#00a389]" />
                                    <span>{actionLabel}</span>
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopyBundleId(bundle.bundleId)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left ${!isVerificator ? 'border-t border-slate-100' : ''}`}
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Salin ID Bundle</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
