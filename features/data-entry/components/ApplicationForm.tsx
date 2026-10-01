'use client';

import React, { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ApplicationFormInput,
    applicationFormSchema,
    APPLICATION_TYPE_LABELS,
    ApplicationTypeEnum,
} from '../schemas/application.schema';
import { createApplication, editApplication } from '../actions/application.actions';
import { TaxSubjectForm } from './TaxSubjectForm';
import { TaxObjectForm } from './TaxObjectForm';
import { BackButton } from '@/components/ui/BackButton';
import { Loader2, Upload, Paperclip, X } from 'lucide-react';

interface ApplicationFormProps {
    mode: 'create' | 'edit';
    initialData?: ApplicationFormInput & { id?: string };
    onSuccess?: (result: { id: string; applicationId: string }) => void;
}

export function ApplicationForm({ mode, initialData, onSuccess }: ApplicationFormProps) {
    const [isPending, startTransition] = useTransition();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const defaultValues: ApplicationFormInput = initialData || {
        applicationType: 'PARTIAL_MUTATION',
        applicationId: '',
        smartgovId: '',
        smartgovCreatedAt: new Date(),
        complementary: [
            {
                taxSubjectData: { name: '', whatsappNumber: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '' },
                taxObjectData: { nop: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '', landArea: null, buildingArea: null, certificate: '' },
            },
        ],
        taxSubject: { name: '', whatsappNumber: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '' },
        taxObject: { nopTemporary: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '', landArea: null, buildingArea: null, certificate: '' },
        files: [],
        note: '',
    };

    const form = useForm<ApplicationFormInput>({
        resolver: zodResolver(applicationFormSchema as any),
        defaultValues,
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = form;

    const currentAppType = watch('applicationType');
    const isNewTaxObject = currentAppType === 'NEW_TAX_OBJECT';
    const isReactivation = currentAppType === 'REACTIVATION';
    const isNoComplementary = isNewTaxObject || isReactivation;
    const isCorrection = currentAppType === 'CORRECTION';

    const steps = [
        { id: 'info', title: 'Informasi Permohonan' },
        ...(!isNoComplementary ? [{ id: 'complementary', title: 'Data Pelengkap (Asal)' }] : []),
        { id: 'requested', title: 'Data Dimohonkan' },
        { id: 'review', title: 'Ringkasan & Simpan' },
    ];

    const totalSteps = steps.length;
    const activeStep = steps[currentStepIndex] || steps[0];

    const {
        fields: compFields,
        append: appendComp,
        remove: removeComp,
    } = useFieldArray({
        control,
        name: 'complementary',
    });

    const handleNextStep = async () => {
        let isStepValid = true;

        if (activeStep.id === 'info') {
            isStepValid = await trigger(['applicationType', 'applicationId', 'smartgovId', 'smartgovCreatedAt']);
        } else if (activeStep.id === 'complementary') {
            isStepValid = await trigger('complementary');
        } else if (activeStep.id === 'requested') {
            isStepValid = await trigger(['taxSubject', 'taxObject', 'files', 'note']);
        }

        if (isStepValid && currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = (data: ApplicationFormInput) => {
        setServerError(null);
        setSuccessMessage(null);

        startTransition(async () => {
            const res =
                mode === 'create'
                    ? await createApplication(data)
                    : await editApplication(initialData?.id!, data);

            if (res.success && res.data) {
                setSuccessMessage(res.message || 'Permohonan berhasil disimpan!');
                if (onSuccess) {
                    onSuccess(res.data);
                }
            } else {
                setServerError(res.message || 'Gagal menyimpan permohonan.');
                if (res.errors) {
                    Object.entries(res.errors).forEach(([key, messages]) => {
                        form.setError(key as any, { message: messages[0] });
                    });
                }
            }
        });
    };

    const activeLinePercentage = totalSteps > 0
        ? ((currentStepIndex + 1) / totalSteps) * 100
        : 0;

    return (
        <div className="max-w-screen-2xl mx-auto space-y-6 pb-16 -mt-4 sm:-mt-5">
            <div className="space-y-1 px-1 mb-10">
                <BackButton />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {mode === 'create' ? 'Tambah Permohonan Baru' : 'Edit Permohonan Data Entry'}
                </h1>
                <p className="text-xs text-slate-500 max-w-3xl">
                    Lengkapi formulir pendaftaran layanan permohonan Pajak Bumi dan/atau Bangunan sesuai dengan dokumen pelayanan fisik dan SmartGov.
                </p>
            </div>

            {serverError && (
                <div className="p-4 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                    <p className="font-semibold">Gagal Menyimpan</p>
                    <p className="text-xs mt-0.5 text-rose-700">{serverError}</p>
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                    <p className="font-semibold">Berhasil!</p>
                    <p className="text-xs mt-0.5 text-emerald-700">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                <div className="shrink-0 sticky top-6 py-2">
                    <div className="relative pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200/80 rounded-full" />
                        <div
                            className="absolute left-0 top-0 w-1 bg-[#00a389] rounded-full transition-all duration-300 ease-in-out"
                            style={{ height: `${activeLinePercentage}%` }}
                        />

                        <div className="flex flex-col">
                            {steps.map((step, idx) => {
                                const isActive = currentStepIndex === idx;
                                const isCompleted = currentStepIndex > idx;

                                return (
                                    <div
                                        key={step.id}
                                        onClick={() => {
                                            if (isCompleted) setCurrentStepIndex(idx);
                                        }}
                                        className={`flex items-center min-h-[48px] py-2 transition-colors ${isCompleted ? 'cursor-pointer' : 'cursor-default'
                                            }`}
                                    >
                                        <span
                                            className={`text-sm transition-all duration-200 select-none whitespace-nowrap ${isActive || isCompleted
                                                ? 'font-bold text-[#00a389]'
                                                : 'font-normal text-slate-400'
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                            {activeStep.title}
                        </h2>
                    </div>

                    {activeStep.id === 'info' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-4 space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-800">Kategori Permohonan</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Pilih jenis permohonan Pajak Bumi dan Bangunan yang diajukan oleh Wajib Pajak.
                                    </p>
                                </div>

                                <div className="lg:col-span-8 space-y-1">
                                    <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                        Jenis Permohonan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {(Object.keys(APPLICATION_TYPE_LABELS) as ApplicationTypeEnum[]).map((key) => {
                                            const label = APPLICATION_TYPE_LABELS[key];
                                            const isSelected = currentAppType === key;

                                            return (
                                                <div
                                                    key={key}
                                                    onClick={() => setValue('applicationType', key)}
                                                    className={`p-3 rounded-sm border cursor-pointer transition-all ${isSelected
                                                        ? 'border-[#00a389] bg-[#00a389]/10'
                                                        : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className={`font-semibold text-xs ${isSelected ? 'text-[#007a66]' : 'text-slate-800'}`}>
                                                        {label.title}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
                                <div className="lg:col-span-4 space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-800">Nomor Registrasi</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Nomor permohonan internal SIPETRA dan nomor pelayanan pada sistem SmartGov.
                                    </p>
                                </div>

                                <div className="lg:col-span-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                                Nomor Permohonan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('applicationId')}
                                                placeholder="2026.001.99"
                                                className={`w-full bg-slate-50 border ${errors.applicationId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                                    } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                                            />
                                            {errors.applicationId && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">
                                                    {errors.applicationId.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                                Nomor SmartGov <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('smartgovId')}
                                                placeholder="SG-2026-9081"
                                                className={`w-full bg-slate-50 border ${errors.smartgovId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                                    } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                                            />
                                            {errors.smartgovId && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">
                                                    {errors.smartgovId.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                                Tgl Pendaftaran SmartGov <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={
                                                    watch('smartgovCreatedAt')
                                                        ? new Date(watch('smartgovCreatedAt')).toISOString().split('T')[0]
                                                        : ''
                                                }
                                                onChange={(e) => setValue('smartgovCreatedAt', new Date(e.target.value))}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep.id === 'complementary' && !isNoComplementary && (
                        <div className="space-y-6">
                            {(currentAppType === 'MERGER_MUTATION' || currentAppType === 'MERGER_AND_PARTIAL_MUTATION') && (
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="text-xs font-semibold text-slate-500">
                                        Daftar NOP Asal ({compFields.length} Objek)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            appendComp({
                                                taxSubjectData: { name: '', whatsappNumber: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '' },
                                                taxObjectData: { nop: '', address: '', block: '', neighborhoodUnit: '', communityUnit: '', subdistrict: '', village: '', landArea: null, buildingArea: null, certificate: '' },
                                            })
                                        }
                                        className="px-3 py-1.5 bg-[#00a389]/10 hover:bg-[#00a389]/20 text-[#007a66] text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                                    >
                                        Tambah NOP Asal
                                    </button>
                                </div>
                            )}

                            {compFields.map((field, idx) => (
                                <div key={field.id} className="space-y-4">
                                    <div className="flex items-center justify-between pb-1 border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800">
                                                NOP Asal #{idx + 1}
                                            </span>
                                        </div>

                                        {compFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeComp(idx)}
                                                className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>

                                    <TaxSubjectForm
                                        prefix={`complementary.${idx}.taxSubjectData`}
                                        register={register}
                                        errors={errors}
                                        title={`Data Subjek Pajak Asal #${idx + 1}`}
                                        isCorrection={isCorrection}
                                        isRequestedData={false}
                                    />

                                    <TaxObjectForm
                                        prefix={`complementary.${idx}.taxObjectData`}
                                        register={register}
                                        errors={errors}
                                        title={`Data Objek Pajak Asal #${idx + 1}`}
                                        isRequestedData={false}
                                        isCorrection={isCorrection}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeStep.id === 'requested' && (
                        <div className="space-y-6">
                            <TaxSubjectForm
                                prefix="taxSubject"
                                register={register}
                                errors={errors}
                                title="Data Wajib Pajak Pemohon"
                                isCorrection={isCorrection}
                                isRequestedData={true}
                            />

                            <TaxObjectForm
                                prefix="taxObject"
                                register={register}
                                errors={errors}
                                title="Data Objek Pajak Dimohonkan"
                                isRequestedData={true}
                                isCorrection={isCorrection}
                            />

                            {/* Section: Catatan & Lampiran Berkas Digital */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
                                <div className="lg:col-span-4 space-y-1">
                                    <h3 className="text-sm font-semibold text-slate-800">Catatan & Berkas Persyaratan</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Tambahkan catatan pendaftaran dan unggah berkas persyaratan permohonan (KTP, Sertifikat, SPPT, dll.).
                                    </p>
                                </div>

                                <div className="lg:col-span-8 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                            Catatan Permohonan <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            {...register('note')}
                                            placeholder="Masukkan catatan khusus permohonan jika ada..."
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                                            Upload Berkas Persyaratan <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 hover:border-[#00a389]/60 transition-all text-center space-y-2">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                id="file-upload-main"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const uploaded = Array.from(e.target.files || []);
                                                    if (uploaded.length === 0) return;
                                                    const currentFiles = watch('files') || [];
                                                    const newUrls = uploaded.map((f) => URL.createObjectURL(f));
                                                    setValue('files', [...currentFiles, ...newUrls]);
                                                }}
                                            />
                                            <label
                                                htmlFor="file-upload-main"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-[#00a389] text-slate-700 text-xs font-semibold rounded-sm cursor-pointer shadow-2xs transition-all"
                                            >
                                                <Upload className="w-3.5 h-3.5 text-[#00a389]" />
                                                Pilih / Drag File Berkas
                                            </label>
                                            <p className="text-[11px] text-slate-400">
                                                Format yang didukung: PDF, PNG, JPG (Maks. 10MB)
                                            </p>
                                        </div>

                                        {watch('files') && watch('files').length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                    Berkas Terlampir ({watch('files').length})
                                                </p>
                                                <div className="divide-y divide-slate-100 border border-slate-200 rounded-sm bg-white overflow-hidden">
                                                    {watch('files').map((fileUrl: string, fileIdx: number) => (
                                                        <div key={fileIdx} className="flex items-center justify-between p-2.5 text-xs">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Paperclip className="w-3.5 h-3.5 text-[#00a389] shrink-0" />
                                                                <span className="truncate font-medium text-slate-700">{`Berkas Persyaratan #${fileIdx + 1}`}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = watch('files') || [];
                                                                    setValue('files', current.filter((_, i) => i !== fileIdx));
                                                                }}
                                                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                                                title="Hapus berkas"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep.id === 'review' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">Jenis Permohonan</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {APPLICATION_TYPE_LABELS[currentAppType]?.title}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">Nomor Permohonan</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {watch('applicationId') || '-'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">Nomor SmartGov</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {watch('smartgovId') || '-'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">Nama Wajib Pajak Pemohon</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {watch('taxSubject.name') || '-'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">NOP Asal</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {isNoComplementary
                                            ? '0 (Tanpa NOP Asal)'
                                            : `${compFields.length} Objek Pajak Asal`}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-1">
                                    <p className="text-slate-500 font-semibold capitalize">Berkas Terlampir</p>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {watch('files')?.length || 0} Berkas
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        {currentStepIndex > 0 ? (
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-sm transition-all cursor-pointer"
                            >
                                Sebelumnya
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStepIndex < totalSteps - 1 ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-5 py-2 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-xs rounded-sm shadow-xs shadow-[#00a389]/30 transition-all cursor-pointer"
                            >
                                Selanjutnya
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isPending}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-xs rounded-sm shadow-xs shadow-[#00a389]/30 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {mode === 'create' ? 'Ajukan Permohonan' : 'Simpan Perubahan'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
