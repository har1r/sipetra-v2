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
    CheckCircle2,
    Clock,
    AlertCircle,
    Edit3,
    MoreVertical,
    FileText,
    Home,
    MapPin,
    Plus,
} from 'lucide-react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '../schemas/application.schema';

interface ApplicationItem {
    id: string;
    applicationNumber: string;
    applicationType: ApplicationTypeEnum;
    status: string;
    serviceNumberDate: Date | string;
    completionDate?: Date | string | null;
    requestedData?: any;
    complementaryData?: any;
    updatedAt: Date | string;
}

interface DataEntryWorkspaceTableProps {
    applications: ApplicationItem[];
}

export function DataEntryWorkspaceTable({ applications }: DataEntryWorkspaceTableProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

    return (
        <div className="space-y-4">
            {/* ================= TOP TOOLBAR CONTROL BAR ================= */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Kiri: Search, Date Picker, More Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Trigger Button */}
                    <button
                        type="button"
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-500 rounded-lg transition-all cursor-pointer"
                        title="Cari permohonan"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* Month-Year Navigator Pill */}
                    <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-sm px-2 py-1 text-xs font-semibold text-slate-700 gap-1">
                        <button type="button" className="p-1 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer">
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

                    {/* More Filters Button */}
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-sm transition-all cursor-pointer"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        More Filters
                    </button>
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
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'table'
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
            {applications.length === 0 ? (
                /* Empty State saat belum ada data */
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">Belum Ada Permohonan</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Anda belum menginputkan permohonan apapun. Klik tombol di bawah untuk membuat permohonan baru.
                    </p>
                    <Link
                        href="/dashboard/applications/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" /> Buat Permohonan Baru
                    </Link>
                </div>
            ) : viewMode === 'cards' ? (
                /* ================= MODE 1: BARIS KARTU (RAPI & PRESISI SESUAI GAMBAR REFERENSI) ================= */
                <div className="space-y-3">
                    {applications.map((app) => {
                        const firstReq = Array.isArray(app.requestedData) ? app.requestedData[0] : null;
                        const applicantName = firstReq?.taxSubjectData?.name || `Permohonan #${app.applicationNumber}`;
                        const villageName = firstReq?.taxSubjectData?.village || firstReq?.taxObjectData?.village || 'Sukamaju';
                        const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                            code: app.applicationType,
                            title: app.applicationType,
                            badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                        };
                        const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';
                        const reqCount = Array.isArray(app.requestedData) ? app.requestedData.length : 1;

                        const startDateParts = getDateParts(app.serviceNumberDate);
                        const endDateParts = getDateParts(app.completionDate || new Date(Date.now() + 7 * 86400000));

                        return (
                            <div
                                key={app.id}
                                className="bg-white rounded-sm border border-slate-200/80 p-4 py-2 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6"
                            >
                                {/* 1. Nama Pemohon & Sub-icons */}
                                <div className="space-y-1 min-w-[180px]">
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                        {applicantName}
                                    </h3>

                                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1" title="Jumlah Objek Dimohon">
                                            <Home className="w-3 h-3 text-slate-400" />
                                            {reqCount} Objek
                                        </span>
                                        <span className="flex items-center gap-1" title="Lokasi Desa / Kelurahan">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {villageName}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Badge Jenis Permohonan (Pill Mini) */}
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

                                {/* 4. ACTIVITIES / KELENGKAPAN BERKAS */}
                                <div className="hidden xl:block">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        ACTIVITIES
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px]" title="Identitas Pemohon">
                                            🪪
                                        </div>
                                        <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px]" title="Sertifikat SHM / Alas Hak">
                                            📜
                                        </div>
                                        <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px]" title="Data Objek Pajak">
                                            🏠
                                        </div>
                                        <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px]" title="Dokumen Pendukung">
                                            📋
                                        </div>
                                    </div>
                                </div>

                                {/* GARIS VERTIKAL 2 */}
                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                {/* 5. Dual Status Indicator (VERIFIKASI & STATUS) */}
                                <div className="flex items-center gap-5 text-xs">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                            VERIFIKASI
                                        </p>
                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            Completed
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                            STATUS
                                        </p>
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
                                </div>

                                {/* GARIS VERTIKAL 3 */}
                                <div className="hidden lg:block h-7 w-px bg-slate-200/80" />

                                {/* 6. No. Pelayanan & Tombol Aksi */}
                                <div className="flex items-center gap-4 justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                            NO. PELAYANAN
                                        </p>
                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            #{app.applicationNumber}
                                        </span>
                                    </div>

                                    {isEditable ? (
                                        <Link
                                            href={`/dashboard/applications/${app.id}/edit`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            View note
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Terkunci</span>
                                    )}

                                    <button
                                        type="button"
                                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ================= MODE 2: TABEL RINGKAS (TABLE VIEW) ================= */
                <div className="bg-white rounded-sm border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="py-3.5 px-4">No. Pelayanan</th>
                                    <th className="py-3.5 px-4">Nama Pemohon</th>
                                    <th className="py-3.5 px-4">Jenis Permohonan</th>
                                    <th className="py-3.5 px-4">Jumlah Objek</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Tanggal Pelayanan</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {applications.map((app) => {
                                    const firstReq = Array.isArray(app.requestedData) ? app.requestedData[0] : null;
                                    const applicantName = firstReq?.taxSubjectData?.name || '-';
                                    const typeInfo = APPLICATION_TYPE_UI[app.applicationType] || {
                                        code: app.applicationType,
                                        title: app.applicationType,
                                        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                                    };
                                    const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';
                                    const reqCount = Array.isArray(app.requestedData) ? app.requestedData.length : 1;

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-[#00a389]">
                                                {app.applicationNumber}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                                                {applicantName}
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-700">
                                                <span
                                                    title={typeInfo.title}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeInfo.badgeStyle}`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {typeInfo.code} - {typeInfo.title}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                {reqCount} Objek Dimohon
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${app.status === 'SUBMITTED'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : app.status === 'REVISION'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                {formatDateShort(app.serviceNumberDate)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {isEditable ? (
                                                    <Link
                                                        href={`/dashboard/applications/${app.id}/edit`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                                    </Link>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">Terkunci</span>
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
