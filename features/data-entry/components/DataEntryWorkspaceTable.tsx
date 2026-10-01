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
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '../schemas/application.schema';

interface ApplicationItem {
    id: string;
    applicationId?: string;
    applicationNumber?: string;
    smartgovId?: string;
    applicationType: ApplicationTypeEnum;
    status: string;
    serviceNumberDate?: Date | string;
    smartgovCreatedAt?: Date | string;
    completionDate?: Date | string | null;
    taxSubject?: any;
    taxObject?: any;
    requestedData?: any;
    complementary?: any;
    complementaryData?: any;
    updatedAt: Date | string;
}

interface DataEntryWorkspaceTableProps {
    applications: ApplicationItem[];
}

export function DataEntryWorkspaceTable({ applications }: DataEntryWorkspaceTableProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

    // Filter Options
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

    // Filtered Applications
    const filteredApplications = React.useMemo(() => {
        return applications.filter((app) => {
            const matchType = selectedType === 'ALL' || app.applicationType === selectedType;
            const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
            return matchType && matchStatus;
        });
    }, [applications, selectedType, selectedStatus]);

    // Helper format tanggal singkat (Contoh: 12 Nov)
    const formatDateShort = (dateVal: Date | string | null | undefined) => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // Helper pecahan tanggal & bulan (Contoh: { day: 12, month: 'Nov' })
    const getDateParts = (dateVal: Date | string | null | undefined) => {
        if (!dateVal) return { day: '-', month: '-' };
        const d = new Date(dateVal);
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('id-ID', { month: 'short' }),
        };
    };

    // Helper format NOP 18 Digit (Contoh: 36.19.150.008.009-0981.0)
    const formatNop = (rawNop?: string) => {
        if (!rawNop) return '36.19.150.008.009-0981.0';
        const digits = rawNop.replace(/\D/g, '');
        if (digits.length < 18) {
            const padded = (digits || '361915000800909810').padEnd(18, '0').slice(0, 18);
            return `${padded.slice(0, 2)}.${padded.slice(2, 4)}.${padded.slice(4, 7)}.${padded.slice(7, 10)}.${padded.slice(10, 13)}-${padded.slice(13, 17)}.${padded.slice(17, 18)}`;
        }
        return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}.${digits.slice(10, 13)}-${digits.slice(13, 17)}.${digits.slice(17, 18)}`;
    };

    const hasActiveFilters = selectedType !== 'ALL' || selectedStatus !== 'ALL';

    return (
        <div className="space-y-4">
            {/* ================= TOP TOOLBAR CONTROL BAR ================= */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Kiri: Search, Date Picker, More Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Trigger Button */}
                    <button
                        type="button"
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-500 rounded-sm transition-all cursor-pointer"
                        title="Cari permohonan"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* Month-Year Navigator Pill */}
                    <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-sm px-2 py-1 text-xs font-semibold text-slate-700 gap-1">
                        <button type="button" className="p-1 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5 px-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>September 2026</span>
                        </div>

                        <button type="button" className="p-1 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* More Filters Hover Popover Container */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsFilterOpen(true)}
                        onMouseLeave={() => setIsFilterOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold rounded-sm transition-all cursor-pointer ${hasActiveFilters || isFilterOpen
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

                        {/* FLYOUT FILTER POPOVER CARD */}
                        {isFilterOpen && (
                            <div className="absolute left-0 top-full mt-1.5 w-[540px] bg-white border border-slate-200/90 rounded-sm shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                                <div className="flex items-start justify-between gap-3">
                                    {/* KOLOM KIRI: JENIS PERMOHONAN */}
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
                                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer text-left ${selectedType === type.key
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

                                    {/* GARIS VERTIKAL PEMISAH */}
                                    <div className="w-px bg-slate-200/80 self-stretch my-1 shrink-0" />

                                    {/* KOLOM KANAN: STATUS PERMOHONAN */}
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
                                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer text-left ${selectedStatus === status.key
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

                                {/* FOOTER ACTION BAR */}
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

                {/* Kanan: Toggle View Mode & Export CSV */}
                <div className="flex items-center gap-2 justify-end">
                    {/* View Mode Toggle Switcher */}
                    <div className="flex items-center p-1 bg-slate-100/80 rounded-sm border border-slate-200/60">
                        <button
                            type="button"
                            onClick={() => setViewMode('cards')}
                            className={`p-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${viewMode === 'cards'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            title="Tampilan Kartu / Baris"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${viewMode === 'table'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            title="Tampilan Tabel"
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Export to CSV Button */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-sm transition-all cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Export to csv
                    </button>
                </div>
            </div>

            {/* ================= KONTEN DATA WORKSPACE ================= */}
            {filteredApplications.length === 0 ? (
                /* Empty State saat belum ada data / filter tidak cocok */
                <div className="bg-white rounded-sm border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">
                        {hasActiveFilters ? 'Tidak Ada Permohonan Ditemukan' : 'Belum Ada Permohonan'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {hasActiveFilters
                            ? 'Tidak ada data permohonan yang sesuai dengan filter yang dipilih. Coba atur ulang filter Anda.'
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
                /* ================= MODE 1: BARIS KARTU (RAPI & PRESISI SESUAI GAMBAR REFERENSI) ================= */
                <div className="space-y-3">
                    {filteredApplications.map((app) => {
                        const firstReq = Array.isArray(app.requestedData) ? app.requestedData[0] : null;
                        const firstComp = Array.isArray(app.complementary) ? app.complementary[0] : (Array.isArray(app.complementaryData) ? app.complementaryData[0] : null);
                        const appNumber = app.applicationId || app.applicationNumber || '-';
                        const applicantName = app.taxSubject?.name || firstReq?.taxSubjectData?.name || `Permohonan #${appNumber}`;
                        const landArea = app.taxObject?.landArea ?? firstReq?.taxObjectData?.landArea ?? 120;
                        const buildingArea = app.taxObject?.buildingArea ?? firstReq?.taxObjectData?.buildingArea ?? 45;
                        const rawNop = app.taxObject?.nop || app.taxObject?.nopTemporary || firstReq?.taxObjectData?.nop || firstReq?.taxObjectData?.nopTemporary || firstComp?.taxObjectData?.nop;
                        const formattedNop = formatNop(rawNop);

                        const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                            code: app.applicationType,
                            title: app.applicationType,
                            badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                        };
                        const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';

                        const startDateParts = getDateParts(app.serviceNumberDate);
                        const endDateParts = getDateParts(app.completionDate || new Date(Date.now() + 7 * 86400000));

                        return (
                            <div
                                key={app.id}
                                className="bg-white rounded-sm border border-slate-200/80 p-4 py-2 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6"
                            >
                                {/* 1. Nama Pemohon & Luas Bangunan / Luas Tanah */}
                                <div className="space-y-1 min-w-[160px]">
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                        {applicantName}
                                    </h3>

                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1" title="Luas Tanah">
                                            <span className="text-slate-400 font-semibold">LT:</span>
                                            {landArea} m²
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1" title="Luas Bangunan">
                                            <span className="text-slate-400 font-semibold">LB:</span>
                                            {buildingArea} m²
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Kolom NOP Objek Pajak */}
                                <div>
                                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs tracking-tight bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-sm inline-block">
                                        {formattedNop}
                                    </span>
                                </div>

                                {/* 3. Badge Jenis Permohonan */}
                                <div>
                                    <span
                                        title={typeInfo.title}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold border ${typeInfo.badgeStyle}`}
                                    >
                                        {typeInfo.code}
                                    </span>
                                </div>

                                {/* 3. Flight Timeline (Tanggal Susun Vertikal: 12 Nov -> 20 Nov) */}
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="text-center">
                                        <span className="block font-bold text-slate-800 text-xs leading-none">
                                            {startDateParts.day}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                                            {startDateParts.month}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                                        <span className="w-2 h-px bg-slate-300" />
                                        <span className="text-slate-400 text-xs">✈</span>
                                        <span className="w-2 h-px bg-slate-300" />
                                    </div>

                                    <div className="text-center">
                                        <span className="block font-bold text-slate-800 text-xs leading-none">
                                            {endDateParts.day}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                                            {endDateParts.month}
                                        </span>
                                    </div>
                                </div>

                                {/* GARIS VERTIKAL 1 */}
                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                {/* 4. STATUS Indicator */}
                                <div>
                                    <span
                                        className={`inline-flex items-center gap-1 font-bold text-xs ${app.status === 'SUBMITTED'
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

                                {/* GARIS VERTIKAL 2 */}
                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                {/* 5. No. Pelayanan & Tombol Aksi (Titik 3 Edit) */}
                                <div className="flex items-center gap-4 justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <div>
                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
                                            #{app.applicationId || app.applicationNumber}
                                        </span>
                                    </div>

                                    {isEditable ? (
                                        <Link
                                            href={`/dashboard/applications/${app.id}/edit`}
                                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                            title="Edit permohonan"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="p-1.5 text-slate-300 cursor-not-allowed"
                                            title="Permohonan terkunci"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ================= MODE 2: TABEL RINGKAS (TABLE VIEW RAPI, SHARP & PRESISI) ================= */
                <div className="bg-white rounded-sm border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[11.5px] font-bold text-slate-600 border-b border-slate-200/80">
                                    <th className="relative py-3 px-3.5 whitespace-nowrap text-center w-10">
                                        <span>No.</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>No. Permohonan</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Nama Pemohon</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Nomor Objek Pajak</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Jenis Permohonan</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Luas (LT / LB)</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Status</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Tgl Masuk</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="relative py-3 px-4 whitespace-nowrap">
                                        <span>Tgl Selesai</span>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-px bg-slate-300/80" />
                                    </th>
                                    <th className="py-3 px-4 whitespace-nowrap text-center">
                                        <span>Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredApplications.map((app, index) => {
                                    const firstReq = Array.isArray(app.requestedData) ? app.requestedData[0] : null;
                                    const firstComp = Array.isArray(app.complementary) ? app.complementary[0] : (Array.isArray(app.complementaryData) ? app.complementaryData[0] : null);
                                    const appNumber = app.applicationId || app.applicationNumber || '-';
                                    const applicantName = app.taxSubject?.name || firstReq?.taxSubjectData?.name || `Permohonan #${appNumber}`;
                                    const landArea = app.taxObject?.landArea ?? firstReq?.taxObjectData?.landArea ?? 120;
                                    const buildingArea = app.taxObject?.buildingArea ?? firstReq?.taxObjectData?.buildingArea ?? 45;
                                    const rawNop = app.taxObject?.nop || app.taxObject?.nopTemporary || firstReq?.taxObjectData?.nop || firstReq?.taxObjectData?.nopTemporary || firstComp?.taxObjectData?.nop;
                                    const formattedNop = formatNop(rawNop);

                                    const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                                        code: app.applicationType,
                                        title: app.applicationType,
                                        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                                    };
                                    const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* 0. Nomor Urut */}
                                            <td className="py-3 px-3.5 whitespace-nowrap text-center font-semibold text-slate-400 text-xs">
                                                {index + 1}
                                            </td>

                                            {/* 1. No. Pelayanan */}
                                            <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800 text-xs">
                                                #{app.applicationId || app.applicationNumber}
                                            </td>

                                            {/* 2. Nama Pemohon */}
                                            <td className="py-3 px-4 whitespace-nowrap text-sm font-bold text-slate-900 tracking-tight">
                                                {applicantName}
                                            </td>

                                            {/* 3. NOP Objek */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs tracking-tight inline-block">
                                                    {formattedNop}
                                                </span>
                                            </td>

                                            {/* 4. Jenis Permohonan */}
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                <span
                                                    title={typeInfo.title}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80"
                                                >
                                                    {typeInfo.code}
                                                </span>
                                            </td>

                                            {/* 5. Luas (LT / LB) */}
                                            <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                                                <span title="Luas Tanah"><span className="text-slate-400 font-semibold">LT:</span> {landArea} m²</span>
                                                <span className="text-slate-300 mx-1.5">•</span>
                                                <span title="Luas Bangunan"><span className="text-slate-400 font-semibold">LB:</span> {buildingArea} m²</span>
                                            </td>

                                            {/* 6. Status */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 font-bold text-xs ${app.status === 'SUBMITTED'
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

                                            {/* 7. Tgl Masuk */}
                                            <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                                                {formatDateShort(app.serviceNumberDate)}
                                            </td>

                                            {/* 8. Tgl Selesai */}
                                            <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                                                {formatDateShort(app.completionDate || new Date(Date.now() + 7 * 86400000))}
                                            </td>

                                            {/* 9. Aksi (Titik 3) */}
                                            <td className="py-3 px-4 whitespace-nowrap text-center">
                                                {isEditable ? (
                                                    <Link
                                                        href={`/dashboard/applications/${app.id}/edit`}
                                                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors inline-block cursor-pointer"
                                                        title="Edit permohonan"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="p-1.5 text-slate-300 cursor-not-allowed inline-block"
                                                        title="Permohonan terkunci"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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
