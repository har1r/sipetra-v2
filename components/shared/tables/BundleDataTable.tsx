'use client';

import React, { useState } from 'react';
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
  Printer,
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';
import { formatShortDate } from '@/lib/utils';

export interface BundleItem {
  id: string;
  bundleId: string;
  applicationType?: ApplicationTypeEnum | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: {
    applications?: number;
  };
  applications?: Array<{
    id: string;
    applicationId: string;
    status: string;
    smartgovId?: string | null;
    taxSubject?: {
      name?: string | null;
    } | null;
  }>;
}

export interface BundleDataTableProps {
  bundles: BundleItem[];
  renderCardFooter?: (bundle: BundleItem) => React.ReactNode;
  renderActions?: (bundle: BundleItem, closeMenu: () => void) => React.ReactNode;
  renderTableRowActions?: (
    bundle: BundleItem,
    closeMenu: () => void,
    isMenuOpen: boolean,
    toggleMenu: () => void
  ) => React.ReactNode;
  toolbarActions?: React.ReactNode;
}

export function BundleDataTable({
  bundles,
  renderCardFooter,
  renderActions,
  renderTableRowActions,
  toolbarActions,
}: BundleDataTableProps) {
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

  const defaultActions = (bundle: BundleItem, closeMenu: () => void) => (
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
        onClick={() => handleCopyBundleId(bundle.bundleId)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left border-t border-slate-100"
      >
        <Copy className="w-3.5 h-3.5 text-slate-600" />
        <span>Salin ID Bundle</span>
      </button>
    </>
  );

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
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#00a389] ml-0.5" />
              )}
            </button>

            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-sm shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Filter Data</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-[11px] font-semibold text-[#00a389] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="py-2.5 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Jenis Permohonan
                    </label>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {typeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedType(opt.key)}
                          className={`w-full text-left px-2 py-1.5 rounded-sm text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            selectedType === opt.key
                              ? 'bg-slate-900 text-white font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedType === opt.key && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a389]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {toolbarActions}
        </div>

        {/* CONTROLS KANAN: STATS & VIEW SWITCHER */}
        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
          <div className="text-xs text-slate-500 font-semibold">
            Menampilkan <span className="font-bold text-slate-900">{filteredBundles.length}</span> bundle
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-xs transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xs transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 rounded-sm transition-colors cursor-pointer"
              title="Unduh Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HASIL FILTER / EMPTY STATE */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-200/80 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada bundle ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Coba sesuaikan kata kunci pencarian atau filter yang Anda pilih.'
              : 'Belum ada data bundle permohonan yang tersedia.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* MODE KARTU */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          {renderActions
                            ? renderActions(bundle, () => setOpenMenuId(null))
                            : defaultActions(bundle, () => setOpenMenuId(null))}
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

                  {renderCardFooter && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {renderCardFooter(bundle)}
                    </div>
                  )}
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
                        {renderTableRowActions ? (
                          renderTableRowActions(
                            bundle,
                            () => setOpenMenuId(null),
                            openMenuId === bundle.id,
                            () => setOpenMenuId(openMenuId === bundle.id ? null : bundle.id)
                          )
                        ) : (
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
                                  {renderActions
                                    ? renderActions(bundle, () => setOpenMenuId(null))
                                    : defaultActions(bundle, () => setOpenMenuId(null))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
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
