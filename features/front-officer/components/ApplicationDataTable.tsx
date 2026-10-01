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
    Clock,
    AlertCircle,
    MoreVertical,
    FileText,
    Plus,
    Pencil,
    Copy,
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '../schemas/application.schema';
import { formatNopInput, formatShortDate } from '@/lib/utils';

export interface ApplicationItem {
    id: string;
    applicationId: string;
    smartgovId?: string | null;
    applicationType: ApplicationTypeEnum;
    status: string;
    requestedNop?: string | null;
    taxSubject?: {
        name?: string;
        whatsappNumber?: string;
        address?: string;
        [key: string]: any;
    };
    taxObject?: {
        nop?: string;
        address?: string;
        landArea?: number | null;
        buildingArea?: number | null;
        [key: string]: any;
    };
    complementary?: Array<{
        taxSubjectData?: any;
        taxObjectData?: any;
    }>;
    smartgovCreatedAt?: Date | string | null;
    smartgovCompletedAt?: Date | string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt: Date | string;
}

interface ApplicationDataTableProps {
    applications: ApplicationItem[];
    actionRole?: 'FRONT_OFFICER' | 'VERIFICATOR' | string;
    renderActions?: (app: ApplicationItem) => React.ReactNode;
}

export function ApplicationDataTable({ applications, actionRole = 'FRONT_OFFICER', renderActions }: ApplicationDataTableProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
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

    const statusOptions = [
        { key: 'ALL', label: 'Semua Status' },
        { key: 'SUBMITTED', label: 'Submitted (Diajukan)' },
        { key: 'REVISION', label: 'Revision (Perbaikan)' },
        { key: 'APPROVED', label: 'Approved (Disetujui)' },
        { key: 'REJECTED', label: 'Rejected (Ditolak)' },
    ];

    const filteredApplications = React.useMemo(() => {
        return applications.filter((app) => {
            const matchType = selectedType === 'ALL' || app.applicationType === selectedType;
            const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
            return matchType && matchStatus;
        });
    }, [applications, selectedType, selectedStatus]);

    const getDateParts = (dateVal: Date | string | null | undefined) => {
        if (!dateVal) return { day: '-', month: '-' };
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return { day: '-', month: '-' };
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('id-ID', { month: 'short' }),
        };
    };

    const renderSmartgovIdPill = (sgId?: string | null) => {
        if (!sgId) {
            return (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-slate-400 bg-slate-100/80 border border-slate-200/60 rounded-sm" title="Nomor SmartGov belum diisi">
                    <Clock className="w-3.5 h-3.5" />
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-800 text-[11px] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-sm">
                {sgId}
            </span>
        );
    };

    const renderSmartgovDate = (dateVal?: Date | string | null) => {
        if (!dateVal) {
            return (
                <span className="inline-flex items-center text-slate-400" title="Tanggal SmartGov belum diisi">
                    <Clock className="w-3.5 h-3.5" />
                </span>
            );
        }
        return <span className="text-xs text-slate-700 font-medium">{formatShortDate(dateVal)}</span>;
    };

    const renderActionDropdown = (app: ApplicationItem) => {
        if (renderActions) return renderActions(app);

        const isMenuOpen = openMenuId === app.id;
        const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';

        return (
            <div className="relative inline-block text-left">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : app.id);
                    }}
                    className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                        isMenuOpen ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                    title="Pilihan Aksi"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                            }}
                        />
                        <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isEditable ? (
                                <Link
                                    href={`/dashboard/front-officer/applications/${app.id}/edit`}
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#00a389] transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Edit Permohonan</span>
                                </Link>
                            ) : (
                                <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 cursor-not-allowed">
                                    <Pencil className="w-3.5 h-3.5 text-slate-300" />
                                    <span>Edit Terkunci</span>
                                </span>
                            )}

                            <Link
                                href={`/dashboard/front-officer/applications/${app.id}/duplicate`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#00a389] transition-colors border-t border-slate-100"
                            >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duplikasi Permohonan</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const hasActiveFilters = selectedType !== 'ALL' || selectedStatus !== 'ALL';

    return (
        <div className="space-y-4">
            {/* TOOLBAR CONTROL BAR */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-500 rounded-sm transition-all cursor-pointer"
                        title="Cari permohonan"
                    >
                        <Search className="w-4 h-4" />
                    </button>

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
                            <div className="absolute left-0 top-full mt-1.5 w-[540px] bg-white border border-slate-200/90 rounded-sm shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                                            Jenis Permohonan
                                        </div>
                                        <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
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

                                    <div className="w-px bg-slate-200/80 self-stretch my-1 shrink-0" />

                                    <div className="w-[190px] shrink-0 space-y-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                                            Status Permohonan
                                        </div>
                                        <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
                                            {statusOptions.map((status) => (
                                                <button
                                                    key={status.key}
                                                    type="button"
                                                    onClick={() => setSelectedStatus(status.key)}
                                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer text-left ${
                                                        selectedStatus === status.key
                                                            ? 'bg-slate-100 text-slate-900 font-bold'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                                >
                                                    <span className="truncate">{status.label}</span>
                                                    {selectedStatus === status.key && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a389] shrink-0 ml-2" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedType('ALL');
                                            setSelectedStatus('ALL');
                                        }}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                        Reset Filter
                                    </button>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {filteredApplications.length} permohonan
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
            {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-sm border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">
                        {hasActiveFilters ? 'Tidak Ada Permohonan Ditemukan' : 'Belum Ada Permohonan'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {hasActiveFilters
                            ? 'Tidak ada data permohonan yang sesuai dengan filter yang dipilih.'
                            : 'Anda belum menginputkan permohonan apapun. Klik tombol di bawah untuk membuat permohonan baru.'}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedType('ALL');
                                setSelectedStatus('ALL');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer"
                        >
                            Reset Filter
                        </button>
                    ) : (
                        <Link
                            href="/dashboard/applications/new"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" /> Buat Permohonan Baru
                        </Link>
                    )}
                </div>
            ) : viewMode === 'cards' ? (
                /* MODE KARTU */
                <div className="space-y-3">
                    {filteredApplications.map((app) => {
                        const appNumber = app.applicationId || '-';
                        const applicantName = app.taxSubject?.name || `Permohonan #${appNumber}`;
                        const landArea = app.taxObject?.landArea ?? '-';
                        const buildingArea = app.taxObject?.buildingArea ?? '-';
                        const firstComp = Array.isArray(app.complementary) ? app.complementary[0] : null;
                        const rawNop = app.requestedNop || app.taxObject?.nop || firstComp?.taxObjectData?.nop || '';
                        const formattedNop = rawNop ? formatNopInput(rawNop) : '-';

                        const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                            code: app.applicationType,
                            title: app.applicationType,
                            badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                        };
                        const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';

                        const sgCreatedParts = app.smartgovCreatedAt ? getDateParts(app.smartgovCreatedAt) : null;
                        const sgCompletedParts = app.smartgovCompletedAt ? getDateParts(app.smartgovCompletedAt) : null;

                        return (
                            <div
                                key={app.id}
                                className="bg-white rounded-sm border border-slate-200/80 p-4 py-3 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6"
                            >
                                <div className="space-y-1 min-w-[170px]">
                                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                                        {applicantName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1" title="Luas Tanah">
                                            <span className="text-slate-400 font-semibold">LT:</span> {landArea} m²
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1" title="Luas Bangunan">
                                            <span className="text-slate-400 font-semibold">LB:</span> {buildingArea} m²
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 text-xs tracking-tight bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-sm">
                                        {formattedNop}
                                    </span>
                                </div>

                                <div>
                                    <span
                                        title={typeInfo.title}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-bold border ${typeInfo.badgeStyle}`}
                                    >
                                        {typeInfo.code}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <div className="text-center">
                                        <span className="block text-[10px] text-slate-400 font-medium mb-0.5">SmartGov ID</span>
                                        {renderSmartgovIdPill(app.smartgovId)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <div className="text-center min-w-[36px]">
                                        {sgCreatedParts ? (
                                            <>
                                                <span className="block font-bold text-slate-800 text-xs leading-none">
                                                    {sgCreatedParts.day}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                                                    {sgCreatedParts.month}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span title="Tanggal dibuat SmartGov belum diisi" className="block">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Dibuat</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                                        <span className="w-2 h-px bg-slate-300" />
                                        <span className="text-slate-400 text-xs">✈</span>
                                        <span className="w-2 h-px bg-slate-300" />
                                    </div>

                                    <div className="text-center min-w-[36px]">
                                        {sgCompletedParts ? (
                                            <>
                                                <span className="block font-bold text-slate-800 text-xs leading-none">
                                                    {sgCompletedParts.day}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                                                    {sgCompletedParts.month}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span title="Tanggal selesai SmartGov belum diisi" className="block">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Selesai</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                <div>
                                    <span
                                        className={`inline-flex items-center gap-1 font-bold text-xs ${
                                            app.status === 'SUBMITTED'
                                                ? 'text-sky-600'
                                                : app.status === 'REVISION'
                                                ? 'text-amber-600'
                                                : 'text-slate-600'
                                        }`}
                                    >
                                        {app.status === 'SUBMITTED' ? (
                                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                                        ) : (
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                        )}
                                        {app.status}
                                    </span>
                                </div>

                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                <div className="flex items-center gap-4 justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <div>
                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
                                            #{app.applicationId}
                                        </span>
                                    </div>

                                    {renderActionDropdown(app)}
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
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">No. Permohonan</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">SmartGov ID</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">Nama Pemohon</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">NOP Objek</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">Jenis</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">Luas (LT/LB)</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">SG Dibuat</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap">SG Selesai</th>
                                    <th className="py-2.5 px-3.5 whitespace-nowrap text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredApplications.map((app, index) => {
                                    const appNumber = app.applicationId || '-';
                                    const applicantName = app.taxSubject?.name || `Permohonan #${appNumber}`;
                                    const landArea = app.taxObject?.landArea ?? '-';
                                    const buildingArea = app.taxObject?.buildingArea ?? '-';
                                    const firstComp = Array.isArray(app.complementary) ? app.complementary[0] : null;
                                    const rawNop = app.requestedNop || app.taxObject?.nop || firstComp?.taxObjectData?.nop || '';
                                    const formattedNop = rawNop ? formatNopInput(rawNop) : '-';

                                    const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                                        code: app.applicationType,
                                        title: app.applicationType,
                                        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                                    };
                                    const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2.5 px-3 whitespace-nowrap text-center font-medium text-slate-400 text-xs">
                                                {index + 1}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-800 text-xs">
                                                #{app.applicationId}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                {renderSmartgovIdPill(app.smartgovId)}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 text-xs tracking-tight">
                                                {applicantName}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-800">
                                                {formattedNop}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <span
                                                    title={typeInfo.title}
                                                    className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80"
                                                >
                                                    {typeInfo.code}
                                                </span>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                                                <span title="Luas Tanah"><span className="text-slate-400 font-semibold">LT:</span> {landArea} m²</span>
                                                <span className="text-slate-300 mx-1.5">•</span>
                                                <span title="Luas Bangunan"><span className="text-slate-400 font-semibold">LB:</span> {buildingArea} m²</span>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 font-bold text-xs ${
                                                        app.status === 'SUBMITTED'
                                                            ? 'text-sky-600'
                                                            : app.status === 'REVISION'
                                                            ? 'text-amber-600'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    {app.status === 'SUBMITTED' ? (
                                                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                                                    ) : (
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                    {app.status}
                                                </span>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-xs text-slate-600">
                                                {renderSmartgovDate(app.smartgovCreatedAt)}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-xs text-slate-600">
                                                {renderSmartgovDate(app.smartgovCompletedAt)}
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                                                {renderActionDropdown(app)}
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
