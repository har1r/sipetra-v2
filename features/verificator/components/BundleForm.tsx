'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BundleCreateInput, bundleCreateSchema } from '../schemas/bundle.schema';
import { createBundle } from '../actions/bundle.actions';
import { BackButton } from '@/components/ui/BackButton';
import {
    Layers,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileText,
    Check,
} from 'lucide-react';
import { formatShortDate, formatNopInput } from '@/lib/utils';
import { APPLICATION_TYPE_UI } from '@/features/front-officer/schemas/application.schema';

interface BundleFormProps {
    pendingApplications?: any[];
}

export function BundleForm({ pendingApplications = [] }: BundleFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const form = useForm<BundleCreateInput>({
        resolver: zodResolver(bundleCreateSchema as any),
        defaultValues: {
            note: '',
            applicationIds: [],
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const selectedAppIds = watch('applicationIds') || [];

    const toggleAppSelection = (id: string) => {
        if (selectedAppIds.includes(id)) {
            setValue(
                'applicationIds',
                selectedAppIds.filter((item) => item !== id)
            );
        } else {
            setValue('applicationIds', [...selectedAppIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedAppIds.length === pendingApplications.length) {
            setValue('applicationIds', []);
        } else {
            setValue(
                'applicationIds',
                pendingApplications.map((app) => app.id)
            );
        }
    };

    const onSubmit = (data: BundleCreateInput) => {
        setServerError(null);
        setSuccessMessage(null);

        startTransition(async () => {
            const res = await createBundle(data);
            if (res.success && res.data) {
                setSuccessMessage(res.message || 'Bundle berhasil dibuat!');
                setTimeout(() => {
                    router.push('/dashboard/workflow/verifikasi');
                    router.refresh();
                }, 1000);
            } else {
                setServerError(res.message || 'Gagal membuat bundle.');
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <BackButton />
                <span className="text-xs font-semibold text-slate-500">Tahap 2 • Verifikasi & Bundle</span>
            </div>

            {/* Form Header Card */}
            <div className="bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="p-3 bg-[#00a389]/10 text-[#00a389] rounded-sm shrink-0">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        Buat Bundle Berkas Baru
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Kelompokkan beberapa permohonan yang telah diverifikasi ke dalam satu bundle berkas untuk diparaf oleh KTU.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {serverError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Section 1: Informasi Utama Bundle (Hanya Catatan/Keterangan) */}
                <div className="bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                        1. Informasi Bundle
                    </h3>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Catatan / Keterangan Bundle <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            rows={3}
                            {...register('note')}
                            placeholder="Tuliskan catatan khusus atau instruksi untuk tahapan paraf KTU..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-[#00a389] focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Section 2: Pilih Permohonan yang Dimasukkan */}
                <div className="bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                2. Pilih Permohonan ({selectedAppIds.length} terpilih)
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Pilih permohonan yang belum masuk ke dalam bundle manapun untuk langsung dimasukkan.
                            </p>
                        </div>
                        {pendingApplications.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="text-xs font-semibold text-[#00a389] hover:text-[#008670] transition-colors cursor-pointer"
                            >
                                {selectedAppIds.length === pendingApplications.length
                                    ? 'Batalkan Semua'
                                    : 'Pilih Semua'}
                            </button>
                        )}
                    </div>

                    {pendingApplications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-semibold text-slate-700">Tidak ada permohonan tanpa bundle</p>
                            <p className="text-[11px] text-slate-400">
                                Anda tetap dapat membuat bundle kosong terlebih dahulu dan memasukkan permohonan nanti.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-sm">
                            {pendingApplications.map((app) => {
                                const isSelected = selectedAppIds.includes(app.id);
                                const typeInfo = APPLICATION_TYPE_UI[app.applicationType as keyof typeof APPLICATION_TYPE_UI] || {
                                    code: app.applicationType,
                                    title: app.applicationType,
                                    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
                                };

                                return (
                                    <div
                                        key={app.id}
                                        onClick={() => toggleAppSelection(app.id)}
                                        className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                            isSelected ? 'bg-[#00a389]/5' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#00a389] border-[#00a389] text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>

                                            <div className="space-y-0.5 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-800 text-xs">
                                                        #{app.applicationId}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs border ${typeInfo.badgeStyle}`}
                                                    >
                                                        {typeInfo.code}
                                                    </span>
                                                    <span className="text-xs text-slate-700 font-semibold truncate">
                                                        {app.taxSubject?.name || 'Tanpa Nama'}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                                    <span className="font-mono">
                                                        {app.requestedNop ? formatNopInput(app.requestedNop) : '-'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatShortDate(app.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Submit Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/workflow/verifikasi')}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white text-xs font-semibold rounded-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan Bundle...</span>
                            </>
                        ) : (
                            <span>Buat Bundle Sekarang</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
