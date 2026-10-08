'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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

const TYPE_OPTIONS = [
  { key: 'ALL', label: 'Semua Jenis' },
  { key: 'PARTIAL_MUTATION', label: 'Mutasi Sebagian' },
  { key: 'EXPIRED_UPDATE', label: 'Mutasi Habis Update' },
  { key: 'EXPIRED_REGULAR', label: 'Mutasi Habis Reguler' },
  { key: 'NEW_TAX_OBJECT', label: 'Objek Pajak Baru' },
  { key: 'CORRECTION', label: 'Pembetulan' },
  { key: 'REACTIVATION', label: 'Pengaktifan' },
  { key: 'MERGER_MUTATION', label: 'Mutasi Penggabungan' },
  { key: 'MERGER_AND_PARTIAL_MUTATION', label: 'Mutasi Penggabungan & Pemecahan' },
] as const;

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function getDateParts(dateVal: Date | string | null | undefined) {
  if (!dateVal) return { day: '-', month: '-' };
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (!d || isNaN(d.getTime())) return { day: '-', month: '-' };
  return {
    day: d.getDate(),
    month: SHORT_MONTH_NAMES[d.getMonth()] || '-',
  };
}

function DefaultBundleActions({
  bundle,
  closeMenu,
}: {
  bundle: BundleItem;
  closeMenu: () => void;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(bundle.bundleId);
    closeMenu();
  };

  return (
    <>
      <a
        href={`/preview/bundle/${bundle.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMenu}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
      >
        <Printer className="w-3.5 h-3.5 text-slate-700" />
        <span>Cetak Rekomendasi</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left border-t border-slate-100"
      >
        <Copy className="w-3.5 h-3.5 text-slate-700" />
        <span>Salin ID Bundle</span>
      </button>
    </>
  );
}

interface BundleCardItemProps {
  bundle: BundleItem;
  isMenuOpen: boolean;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  renderActions?: (bundle: BundleItem, closeMenu: () => void) => React.ReactNode;
  renderCardFooter?: (bundle: BundleItem) => React.ReactNode;
}

const BundleCardItem = memo(function BundleCardItem({
  bundle,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  renderActions,
  renderCardFooter,
}: BundleCardItemProps) {
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
    <div className="bg-white rounded-sm border border-slate-200/80 hover:border-slate-300 transition-all p-4 shadow-xs hover:shadow-sm flex flex-col justify-between gap-3 relative [content-visibility:auto] [contain-intrinsic-size:180px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div>
            <Package className="w-5 h-5 text-[#00a389]" />
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
            onClick={() => onToggleMenu(bundle.id)}
            className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={onCloseMenu}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {renderActions
                  ? renderActions(bundle, onCloseMenu)
                  : <DefaultBundleActions bundle={bundle} closeMenu={onCloseMenu} />}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Jenis Bundel</span>
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
          <span className="text-slate-400 font-medium">Jumlah Permohonan</span>
          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-sm text-[11px]">
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
});

interface BundleTableRowItemProps {
  bundle: BundleItem;
  index: number;
  isMenuOpen: boolean;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  renderActions?: (bundle: BundleItem, closeMenu: () => void) => React.ReactNode;
  renderTableRowActions?: (
    bundle: BundleItem,
    closeMenu: () => void,
    isMenuOpen: boolean,
    toggleMenu: () => void
  ) => React.ReactNode;
}

const BundleTableRowItem = memo(function BundleTableRowItem({
  bundle,
  index,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  renderActions,
  renderTableRowActions,
}: BundleTableRowItemProps) {
  const appCount = bundle._count?.applications ?? bundle.applications?.length ?? 0;
  const typeInfo = bundle.applicationType
    ? APPLICATION_TYPE_UI[bundle.applicationType as ApplicationTypeEnum] || {
        code: bundle.applicationType,
        title: bundle.applicationType,
        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
      }
    : null;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
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
            onCloseMenu,
            isMenuOpen,
            () => onToggleMenu(bundle.id)
          )
        ) : (
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => onToggleMenu(bundle.id)}
              className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={onCloseMenu}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  {renderActions
                    ? renderActions(bundle, onCloseMenu)
                    : <DefaultBundleActions bundle={bundle} closeMenu={onCloseMenu} />}
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});

export function BundleDataTable({
  bundles,
  renderCardFooter,
  renderActions,
  renderTableRowActions,
  toolbarActions,
}: BundleDataTableProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const filteredBundles = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    return bundles.filter((bundle) => {
      if (q) {
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
  }, [bundles, debouncedQuery, selectedType]);

  const hasActiveFilters = Boolean(debouncedQuery.trim()) || selectedType !== 'ALL';

  const resetFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
    setSelectedType('ALL');
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
    setIsSearchOpen(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-sm px-2.5 py-1 text-xs gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari ID Bundle, Jenis, Pembuat..."
                className="bg-transparent border-none outline-none text-slate-800 text-xs w-48 font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={handleClearSearch}
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
                      {TYPE_OPTIONS.map((opt) => (
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

        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBundles.map((bundle) => (
            <BundleCardItem
              key={bundle.id}
              bundle={bundle}
              isMenuOpen={openMenuId === bundle.id}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              renderActions={renderActions}
              renderCardFooter={renderCardFooter}
            />
          ))}
        </div>
      ) : (
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
                {filteredBundles.map((bundle, index) => (
                  <BundleTableRowItem
                    key={bundle.id}
                    bundle={bundle}
                    index={index}
                    isMenuOpen={openMenuId === bundle.id}
                    onToggleMenu={handleToggleMenu}
                    onCloseMenu={handleCloseMenu}
                    renderActions={renderActions}
                    renderTableRowActions={renderTableRowActions}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
