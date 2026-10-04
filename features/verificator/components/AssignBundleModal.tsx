'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
    X,
    FolderPlus,
    Search,
    Loader2,
    CheckCircle2,
    Layers,
    Plus,
    AlertCircle,
} from 'lucide-react';
import { ApplicationType } from '@prisma/client';
import { APPLICATION_TYPE_UI, ApplicationTypeEnum } from '@/features/front-officer/schemas/application.schema';
import { getAvailableBundles, addApplicationToBundle } from '../actions/bundle.actions';
import { CreateBundleModal } from './CreateBundleModal';
import { useRouter } from 'next/navigation';

interface AssignBundleModalProps {
    application: {
        id: string;
        applicationId: string;
        applicationType?: ApplicationType | any;
        taxSubject?: { name?: string };
    } | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AssignBundleModal({
    application,
    onClose,
    onSuccess,
}: AssignBundleModalProps) {
    const router = useRouter();
    const [bundles, setBundles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!application) return;

        async function fetchBundles() {
            setIsLoading(true);
            try {
                const res = await getAvailableBundles(application?.applicationType);
                if (res.success && res.data) {
                    setBundles(res.data);
                }
            } catch (err) {
                console.error('Failed to load bundles:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBundles();
    }, [application]);

    if (!application) return null;

    const filteredBundles = bundles.filter((b) => {
        const query = searchQuery.toLowerCase();
        const code = (b.bundleId || '').toLowerCase();
        return code.includes(query);
    });

    const handleAssign = (bundleId: string) => {
        setErrorMsg(null);
        setSelectedBundleId(bundleId);

        startTransition(async () => {
            const res = await addApplicationToBundle(application.id, bundleId);
            if (res.success) {
                setSuccessMsg(res.message || 'Permohonan berhasil dimasukkan ke bundle.');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                    router.refresh();
                }, 800);
            } else {
                setErrorMsg(res.message || 'Gagal memasukkan permohonan ke bundle.');
            }
        });
    };

    const appTypeInfo = application.applicationType
        ? APPLICATION_TYPE_UI[application.applicationType as ApplicationTypeEnum]
        : null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                <div className="fixed inset-0" onClick={onClose} />

                <div className="relative bg-white rounded-md shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-[#00a389]/10 text-[#00a389] rounded-sm">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Masukkan ke Bundle
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Permohonan #{application.applicationId} • {application.taxSubject?.name || 'Wajib Pajak'}
                                    {appTypeInfo && (
                                        <span className="ml-1.5 font-semibold text-slate-700">
                                            ({appTypeInfo.code})
                                        </span>
                                    )}
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
                        {errorMsg && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kode bundle..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:border-[#00a389] focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors shrink-0 shadow-xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Bundle Baru
                            </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-sm bg-slate-50/50">
                            {isLoading ? (
                                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00a389]" />
                                    <span>Memuat daftar bundle...</span>
                                </div>
                            ) : filteredBundles.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500 space-y-2 p-4">
                                    <FolderPlus className="w-6 h-6 text-slate-400 mx-auto" />
                                    <p className="font-semibold text-slate-700">Belum ada Bundle yang cocok</p>
                                    <p className="text-[11px] text-slate-400">
                                        Tidak ditemukan bundle aktif untuk jenis {appTypeInfo?.code || 'ini'}.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Buat Bundle Sekarang
                                    </button>
                                </div>
                            ) : (
                                filteredBundles.map((b) => {
                                    const isCurrentSelected = selectedBundleId === b.id && isPending;
                                    const count = b._count?.applications || 0;
                                    const bTypeInfo = b.applicationType
                                        ? APPLICATION_TYPE_UI[b.applicationType as ApplicationTypeEnum]
                                        : null;

                                    return (
                                        <div
                                            key={b.id}
                                            className="p-3 bg-white hover:bg-[#00a389]/5 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-slate-800">
                                                        {b.bundleId}
                                                    </span>
                                                    {bTypeInfo && (
                                                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-xs">
                                                            {bTypeInfo.code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    <span>{count} permohonan</span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => handleAssign(b.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-[#00a389] text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                            >
                                                {isCurrentSelected ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Memproses...</span>
                                                    </>
                                                ) : (
                                                    <span>Pilih Bundle</span>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-sm transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateBundleModal
                    initialApplicationType={application.applicationType}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
}
