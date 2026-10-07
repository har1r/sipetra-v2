'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    X,
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Check,
    FolderClock,
    Package
} from 'lucide-react';
import { ApplicationType } from '@prisma/client';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';
import {
    createBundle,
    getUnbundledApplications,
    getAvailableBundles,
    assignApplicationsToBundle,
} from '../actions/bundle.actions';
import { formatNopInput } from '@/lib/utils';

interface CreateBundleModalProps {
    initialApplicationType?: ApplicationType;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateBundleModal({
    initialApplicationType,
    onClose,
    onSuccess,
}: CreateBundleModalProps) {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<ApplicationType>(
        initialApplicationType || ApplicationType.PARTIAL_MUTATION
    );
    const [applications, setApplications] = useState<any[]>([]);
    const [emptyBundles, setEmptyBundles] = useState<any[]>([]);
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setIsLoadingApps(true);
            setSelectedAppIds([]);
            try {
                const [appsRes, bundlesRes] = await Promise.all([
                    getUnbundledApplications(selectedType),
                    getAvailableBundles(),
                ]);

                if (isMounted) {
                    if (appsRes.success && appsRes.data) {
                        setApplications(appsRes.data);
                    }
                    if (bundlesRes.success && bundlesRes.data) {
                        const empties = bundlesRes.data.filter(
                            (b) =>
                                (b._count?.applications || 0) === 0 &&
                                (!b.applicationType || b.applicationType === selectedType)
                        );
                        setEmptyBundles(empties);
                    }
                }
            } catch (err) {
                console.error('Failed to load data for bundle modal:', err);
            } finally {
                if (isMounted) setIsLoadingApps(false);
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [selectedType]);

    const filteredApplications = applications.filter((app) => {
        const query = searchQuery.toLowerCase();
        const appId = (app.applicationId || '').toLowerCase();
        const name = (app.taxSubject?.name || '').toLowerCase();
        const nop = (app.requestedNop || app.taxObject?.nop || '').toLowerCase();
        return appId.includes(query) || name.includes(query) || nop.includes(query);
    });

    const toggleAppSelection = (id: string) => {
        setSelectedAppIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAppIds.length === filteredApplications.length) {
            setSelectedAppIds([]);
        } else {
            setSelectedAppIds(filteredApplications.map((app) => app.id));
        }
    };

    const handleCreate = () => {
        setServerError(null);
        setSuccessMessage(null);

        startTransition(async () => {
            const res = await createBundle({
                applicationType: selectedType,
                applicationIds: selectedAppIds,
            });

            if (res.success && res.data) {
                setSuccessMessage(res.message || 'Bundle berhasil dibuat!');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                    router.refresh();
                }, 800);
            } else {
                setServerError(res.message || 'Gagal membuat bundle.');
            }
        });
    };

    const handleAssignToExistingEmpty = (bundleId: string) => {
        if (selectedAppIds.length === 0) {
            setServerError('Pilih minimal satu berkas permohonan terlebih dahulu.');
            return;
        }

        setServerError(null);
        setSuccessMessage(null);

        startTransition(async () => {
            const res = await assignApplicationsToBundle(selectedAppIds, bundleId);
            if (res.success) {
                setSuccessMessage(res.message || 'Permohonan berhasil dimasukkan ke bundle.');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                    router.refresh();
                }, 800);
            } else {
                setServerError(res.message || 'Gagal memasukkan permohonan ke bundle.');
            }
        });
    };

    const currentTypeInfo = APPLICATION_TYPE_UI[selectedType as ApplicationTypeEnum];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative bg-white rounded-md shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <div>
                            <Package className="w-5 h-5 text-[#00a389]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Buat Bundle Baru
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                1 Bundle wajib mengelompokkan permohonan dengan jenis yang sama.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer"
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

                    {successMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                            Pilih Jenis Permohonan Bundle <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as ApplicationType)}
                            disabled={isPending}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-sm font-semibold text-slate-800 focus:bg-white focus:border-[#00a389] focus:outline-none transition-colors cursor-pointer"
                        >
                            {Object.entries(APPLICATION_TYPE_UI).map(([key, info]) => (
                                <option key={key} value={key}>
                                    {info.code} — {info.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {emptyBundles.length > 0 && (
                        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-sm text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                                <FolderClock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="font-bold text-amber-900">
                                        Terdapat Bundle Kosong ({emptyBundles[0].bundleId})
                                    </p>
                                    <p className="text-[11px] text-amber-700">
                                        Terdapat bundle kosong yang belum terisi berkas. Sebaiknya gunakan bundle ini terlebih dahulu sebelum membuat nomor bundle baru.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending || selectedAppIds.length === 0}
                                onClick={() => handleAssignToExistingEmpty(emptyBundles[0].id)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-sm transition-colors shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                                title={
                                    selectedAppIds.length === 0
                                        ? 'Pilih berkas permohonan terlebih dahulu'
                                        : `Masukkan ${selectedAppIds.length} berkas ke Bundle ${emptyBundles[0].bundleId}`
                                }
                            >
                                <span>Gunakan Bundel Ini ({selectedAppIds.length})</span>
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700">
                                Masukkan permohonan ke dalam bundel
                            </span>
                            {filteredApplications.length > 0 && (
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="text-[11px] font-semibold text-[#00a389] hover:underline cursor-pointer"
                                >
                                    {selectedAppIds.length === filteredApplications.length
                                        ? 'Batalkan Semua'
                                        : 'Pilih Semua'}
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari No. Permohonan, Pemohon, atau NOP..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:border-[#00a389] focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-sm bg-slate-50/50">
                            {isLoadingApps ? (
                                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
                                    <span>Memuat berkas permohonan...</span>
                                </div>
                            ) : filteredApplications.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500 p-4">
                                    <p className="font-semibold text-slate-700">
                                        Tidak ada permohonan tanpa bundle untuk jenis ini
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Semua permohonan {currentTypeInfo?.code || selectedType} sudah memiliki bundle atau belum diajukan.
                                    </p>
                                </div>
                            ) : (
                                filteredApplications.map((app) => {
                                    const isSelected = selectedAppIds.includes(app.id);
                                    const nop = app.requestedNop || app.taxObject?.nop || '';

                                    return (
                                        <div
                                            key={app.id}
                                            onClick={() => toggleAppSelection(app.id)}
                                            className={`p-3 transition-colors flex items-center justify-between gap-3 cursor-pointer ${isSelected ? 'bg-[#00a389]/10' : 'bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                        ? 'bg-[#00a389] border-[#00a389] text-white'
                                                        : 'border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>

                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-slate-900">
                                                            #{app.applicationId}
                                                        </span>
                                                        <span className="text-xs text-slate-700 truncate">
                                                            • {app.taxSubject?.name || 'Wajib Pajak'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {nop ? formatNopInput(nop) : 'NOP belum ditentukan'}
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-xs shrink-0">
                                                {app.status}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                        {selectedAppIds.length} permohonan dipilih
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-sm transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={isPending || selectedAppIds.length === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Membuat Bundle...</span>
                                </>
                            ) : (
                                <span>Buat Bundle Baru</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
