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
    Star,
    Printer,
    X,
    PackagePlus,
    PackageMinus,
    Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '../schemas/application.schema';
import { formatNopInput, formatShortDate } from '@/lib/utils';
import { toggleApplicationFavorite, getApplicationReceipt } from '../actions/application.actions';
import { removeApplicationFromBundle } from '@/features/verificator/actions/bundle.actions';
import { AssignBundleModal } from '@/features/verificator/components/AssignBundleModal';

export interface ApplicationItem {
    id: string;
    applicationId: string;
    smartgovId?: string | null;
    applicationType: ApplicationTypeEnum;
    status: string;
    isFavorite?: boolean;
    requestedNop?: string | null;
    bundleId?: string | null;
    bundle?: {
        id: string;
        bundleId: string;
        name?: string | null;
        note?: string | null;
    } | null;
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
    const router = useRouter();
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [favoriteState, setFavoriteState] = useState<Record<string, boolean>>({});
    const [loadingFavoriteId, setLoadingFavoriteId] = useState<string | null>(null);
    const [receiptApp, setReceiptApp] = useState<any | null>(null);
    const [isReceiptLoading, setIsReceiptLoading] = useState<boolean>(false);
    const [assignModalApp, setAssignModalApp] = useState<ApplicationItem | null>(null);
    const [loadingBundleAppId, setLoadingBundleAppId] = useState<string | null>(null);

    const isFrontOfficer = session?.user?.role === 'FRONT_OFFICER' || actionRole === 'FRONT_OFFICER';

    const handleOpenReceipt = async (app: ApplicationItem) => {
        setIsReceiptLoading(true);
        setReceiptApp(app);
        try {
            const res = await getApplicationReceipt(app.id);
            if (res.success && res.data) {
                setReceiptApp(res.data);
            }
        } catch {
            setReceiptApp(app);
        } finally {
            setIsReceiptLoading(false);
        }
    };

    const formatFullReceiptDate = (dateVal?: Date | string | null) => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' WIB';
    };

    const getIsFavorite = (app: ApplicationItem) => {
        if (favoriteState[app.id] !== undefined) {
            return favoriteState[app.id];
        }
        return Boolean(app.isFavorite);
    };

    const handleToggleFavorite = async (e: React.MouseEvent, app: ApplicationItem) => {
        e.stopPropagation();
        if (!isFrontOfficer || loadingFavoriteId === app.id) return;

        const currentVal = getIsFavorite(app);
        const nextVal = !currentVal;

        setFavoriteState((prev) => ({ ...prev, [app.id]: nextVal }));
        setLoadingFavoriteId(app.id);

        try {
            const res = await toggleApplicationFavorite(app.id, nextVal);
            if (!res.success) {
                setFavoriteState((prev) => ({ ...prev, [app.id]: currentVal }));
            } else {
                router.refresh();
            }
        } catch {
            setFavoriteState((prev) => ({ ...prev, [app.id]: currentVal }));
        } finally {
            setLoadingFavoriteId(null);
        }
    };

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

    const handleRemoveFromBundle = async (app: ApplicationItem) => {
        const bundleCode = app.bundle?.bundleId || 'ini';
        if (!window.confirm(`Apakah Anda yakin ingin mengeluarkan permohonan #${app.applicationId} dari Bundle ${bundleCode}?`)) {
            return;
        }

        setLoadingBundleAppId(app.id);
        try {
            const res = await removeApplicationFromBundle(app.id);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.message || 'Gagal mengeluarkan permohonan dari bundle.');
            }
        } catch (err) {
            console.error('Error removing application from bundle:', err);
        } finally {
            setLoadingBundleAppId(null);
        }
    };

    const renderActionDropdown = (app: ApplicationItem) => {
        if (renderActions) return renderActions(app);

        const isMenuOpen = openMenuId === app.id;
        const isEditable = app.status === 'SUBMITTED' || app.status === 'REVISION';
        const inBundle = Boolean(app.bundleId || app.bundle);
        const isVerificator = actionRole === 'VERIFICATOR';

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
                            className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isVerificator ? (
                                <>
                                    {!inBundle ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                setAssignModalApp(app);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            <PackagePlus className="w-3.5 h-3.5 text-[#00a389]" />
                                            <span>Masukkan ke Bundle</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={loadingBundleAppId === app.id}
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                handleRemoveFromBundle(app);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <PackageMinus className="w-3.5 h-3.5 text-amber-600" />
                                            <span>
                                                {loadingBundleAppId === app.id ? 'Mengeluarkan...' : 'Keluarkan dari Bundle'}
                                            </span>
                                        </button>
                                    )}

                                    <Link
                                        href={`/dashboard/workflow/applications/${app.id}/edit`}
                                        onClick={() => setOpenMenuId(null)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors border-t border-slate-100"
                                    >
                                        <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Edit Permohonan</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {isEditable ? (
                                        <Link
                                            href={`/dashboard/workflow/applications/${app.id}/edit`}
                                            onClick={() => setOpenMenuId(null)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                            <span>Edit Permohonan</span>
                                        </Link>
                                    ) : (
                                        <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 cursor-not-allowed">
                                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Terkunci</span>
                                        </span>
                                    )}

                                    <Link
                                        href={`/dashboard/workflow/applications/${app.id}/duplicate`}
                                        onClick={() => setOpenMenuId(null)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors border-t border-slate-100"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Duplikasi Permohonan</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenMenuId(null);
                                            handleOpenReceipt(app);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors border-t border-slate-100 cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Cetak Bukti</span>
                                    </button>
                                </>
                            )}
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
                            href="/dashboard/workflow/applications/new"
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
                                <div className="flex items-center gap-3 min-w-[200px]">
                                    <button
                                        type="button"
                                        disabled={!isFrontOfficer || loadingFavoriteId === app.id}
                                        onClick={(e) => handleToggleFavorite(e, app)}
                                        className={`p-1.5 rounded-sm transition-colors shrink-0 ${
                                            isFrontOfficer ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default opacity-80'
                                        } ${
                                            getIsFavorite(app)
                                                ? 'text-amber-500'
                                                : 'text-slate-300 hover:text-amber-400'
                                        }`}
                                        title={
                                            !isFrontOfficer
                                                ? (getIsFavorite(app) ? 'Permohonan Prioritas / Favorit' : 'Bukan Favorit')
                                                : (getIsFavorite(app) ? 'Hapus dari Favorit' : 'Tandai sebagai Favorit')
                                        }
                                    >
                                        <Star
                                            className={`w-4 h-4 transition-transform ${
                                                getIsFavorite(app)
                                                    ? 'fill-amber-400 text-amber-500 scale-110'
                                                    : 'text-slate-300 hover:text-amber-400'
                                            }`}
                                        />
                                    </button>
                                    <div className="space-y-1">
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
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs">
                                            #{app.applicationId}
                                        </span>
                                        {app.bundle && (
                                            <span
                                                className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#008670] bg-[#00a389]/10 border border-[#00a389]/30 px-1.5 py-0.5 rounded-xs"
                                                title={`Bundle: ${app.bundle.name || app.bundle.bundleId}`}
                                            >
                                                <Layers className="w-3 h-3 text-[#00a389]" />
                                                {app.bundle.bundleId}
                                            </span>
                                        )}
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
                                    <th className="py-2.5 px-2 whitespace-nowrap text-center w-8">
                                        <span className="sr-only">Favorit</span>
                                        <Star className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                                    </th>
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

                                            <td className="py-2.5 px-2 whitespace-nowrap text-center">
                                                <button
                                                    type="button"
                                                    disabled={!isFrontOfficer || loadingFavoriteId === app.id}
                                                    onClick={(e) => handleToggleFavorite(e, app)}
                                                    className={`p-1 rounded-sm transition-colors inline-flex items-center justify-center ${
                                                        isFrontOfficer ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default opacity-80'
                                                    } ${
                                                        getIsFavorite(app)
                                                            ? 'text-amber-500'
                                                            : 'text-slate-300 hover:text-amber-400'
                                                    }`}
                                                    title={
                                                        !isFrontOfficer
                                                            ? (getIsFavorite(app) ? 'Permohonan Prioritas / Favorit' : 'Bukan Favorit')
                                                            : (getIsFavorite(app) ? 'Hapus dari Favorit' : 'Tandai sebagai Favorit')
                                                    }
                                                >
                                                    <Star
                                                        className={`w-3.5 h-3.5 transition-transform ${
                                                            getIsFavorite(app)
                                                                ? 'fill-amber-400 text-amber-500 scale-110'
                                                                : 'text-slate-300 hover:text-amber-400'
                                                        }`}
                                                    />
                                                </button>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-800 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span>#{app.applicationId}</span>
                                                    {app.bundle && (
                                                        <span
                                                            className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#008670] bg-[#00a389]/10 border border-[#00a389]/30 px-1.5 py-0.5 rounded-xs"
                                                            title={`Bundle: ${app.bundle.name || app.bundle.bundleId}`}
                                                        >
                                                            <Layers className="w-3 h-3 text-[#00a389]" />
                                                            {app.bundle.bundleId}
                                                        </span>
                                                    )}
                                                </div>
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

            {/* MODAL PREVIEW BUKTI PENERIMAAN PELAYANAN */}
            {receiptApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div
                        className="fixed inset-0 no-print"
                        onClick={() => setReceiptApp(null)}
                    />

                    <div className="relative bg-white rounded-md shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
                        {/* Control bar */}
                        <div className="no-print flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Printer className="w-4 h-4 text-slate-700" />
                                <span className="text-xs font-bold text-slate-800">
                                    Pratinjau Bukti Penerimaan Pelayanan
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm shadow-xs transition-colors cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    Cetak Dokumen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReceiptApp(null)}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer"
                                    title="Tutup"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Receipt Paper */}
                        <div id="printable-receipt-area" className="p-8 text-slate-900 bg-white font-sans text-xs select-text">
                            {/* KOP RESMI */}
                            <div className="text-center pb-3 border-b-2 border-slate-900 space-y-0.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Pemerintah Kabupaten / Kota — Badan Pendapatan Daerah
                                </h4>
                                <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-950">
                                    Sistem Informasi Pelayanan Pajak Daerah (SIPETRA)
                                </h2>
                                <p className="text-[11px] font-semibold text-slate-600">
                                    Tanda Terima Berkas Pelayanan Pajak Bumi dan Bangunan (PBB-P2)
                                </p>
                            </div>

                            {/* JUDUL DOKUMEN */}
                            <div className="text-center my-4">
                                <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-sm font-extrabold text-xs uppercase tracking-wider text-slate-900">
                                    Bukti Penerimaan Pelayanan Sementara
                                </span>
                            </div>

                            {/* NOMOR & TANGGAL */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-200 mb-4 bg-slate-50/50 px-3 rounded-sm">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                                        Nomor Permohonan (SIPETRA)
                                    </span>
                                    <span className="font-mono text-sm font-bold text-slate-950">
                                        #{receiptApp.applicationId}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                                        Tanggal & Waktu Diterima
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {formatFullReceiptDate(receiptApp.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* DATA PERMOHONAN */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
                                        A. Data Wajib Pajak (Pemohon)
                                    </h4>
                                    <table className="w-full text-xs">
                                        <tbody>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 w-44 font-semibold text-slate-600">Nama Pemohon</td>
                                                <td className="py-1.5 font-bold text-slate-900">
                                                    {receiptApp.taxSubject?.name || '-'}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 font-semibold text-slate-600">Nomor WhatsApp / HP</td>
                                                <td className="py-1.5 text-slate-800 font-mono">
                                                    {receiptApp.taxSubject?.whatsappNumber || '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 font-semibold text-slate-600">Alamat Pemohon</td>
                                                <td className="py-1.5 text-slate-800">
                                                    {receiptApp.taxSubject?.address || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
                                        B. Data Objek Pajak & Layanan
                                    </h4>
                                    <table className="w-full text-xs">
                                        <tbody>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 w-44 font-semibold text-slate-600">Nomor Objek Pajak (NOP)</td>
                                                <td className="py-1.5 font-mono font-bold text-slate-900">
                                                    {receiptApp.requestedNop
                                                        ? formatNopInput(receiptApp.requestedNop)
                                                        : receiptApp.taxObject?.nop
                                                        ? formatNopInput(receiptApp.taxObject.nop)
                                                        : '-'}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 font-semibold text-slate-600">Jenis Permohonan</td>
                                                <td className="py-1.5 font-semibold text-slate-900">
                                                    {APPLICATION_TYPE_UI[receiptApp.applicationType as ApplicationTypeEnum]?.title || receiptApp.applicationType}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 font-semibold text-slate-600">Luas Tanah (LT)</td>
                                                <td className="py-1.5 font-semibold text-slate-800">
                                                    {receiptApp.taxObject?.landArea != null ? `${receiptApp.taxObject.landArea} m²` : '-'}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-100">
                                                <td className="py-1.5 font-semibold text-slate-600">Luas Bangunan (LB)</td>
                                                <td className="py-1.5 font-semibold text-slate-800">
                                                    {receiptApp.taxObject?.buildingArea != null ? `${receiptApp.taxObject.buildingArea} m²` : '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 font-semibold text-slate-600">Alamat Objek Pajak</td>
                                                <td className="py-1.5 text-slate-800">
                                                    {receiptApp.taxObject?.address || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* KOTAK KETENTUAN SLA & SMARTGOV */}
                            <div className="my-5 p-3.5 bg-slate-50 border border-slate-300 rounded-sm space-y-1 text-slate-800">
                                <h5 className="font-bold text-[11px] text-slate-900 uppercase tracking-wide">
                                    Ketentuan Standar Pelayanan (SLA) & SmartGov:
                                </h5>
                                <p className="text-[11px] leading-relaxed text-slate-700">
                                    Dokumen ini merupakan <strong>bukti penerimaan sementara yang berdurasi 10 hari sesuai Standar Layanan (SLA)</strong>. Berkas permohonan Anda akan diproses dan diverifikasi oleh petugas, baru nanti akan diberikan <strong>bukti pelayanan resmi dari SmartGov</strong>.
                                </p>
                            </div>

                            {/* TANDA TANGAN */}
                            <div className="grid grid-cols-2 gap-8 pt-4 mt-4 border-t border-slate-200 text-center">
                                <div className="space-y-12">
                                    <span className="block text-slate-600 font-medium text-[11px]">
                                        Wajib Pajak / Pemohon,
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-900 border-b border-slate-400 pb-1 inline-block min-w-[160px]">
                                            {receiptApp.taxSubject?.name || '................................'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <span className="block text-slate-600 font-medium text-[11px]">
                                        Petugas Loket Front Officer,
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-900 border-b border-slate-400 pb-1 inline-block min-w-[160px]">
                                            {receiptApp.frontOfficer?.name || session?.user?.name || 'Petugas Front Officer'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="mt-8 pt-2 border-t border-dotted border-slate-300 text-center text-[10px] text-slate-400">
                                Dicetak melalui Sistem SIPETRA Architax • Simpan lembar ini sebagai tanda bukti resmi penerimaan berkas
                            </div>
                        </div>
                    </div>

                    <style jsx global>{`
                        @media print {
                            body * {
                                visibility: hidden !important;
                            }
                            #printable-receipt-area,
                            #printable-receipt-area * {
                                visibility: visible !important;
                            }
                            #printable-receipt-area {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 24px !important;
                                background: white !important;
                                color: black !important;
                                box-shadow: none !important;
                                border: none !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    `}</style>
                </div>
            )}

            {/* MODAL ASSIGN BUNDLE UNTUK VERIFIKATOR */}
            {assignModalApp && (
                <AssignBundleModal
                    application={assignModalApp}
                    onClose={() => setAssignModalApp(null)}
                />
            )}
        </div>
    );
}
