'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, get } from 'react-hook-form';
import { formatNopInput } from '@/lib/utils';

interface TaxObjectFormProps {
    prefix: string;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    setValue?: UseFormSetValue<any>;
    title?: string;
    description?: string;
    isRequestedData?: boolean;
    isNewOrReactivation?: boolean;
    isFirstSection?: boolean;
}

export function TaxObjectForm({
    prefix,
    register,
    errors,
    setValue,
    title = 'Informasi Objek Pajak',
    isRequestedData = false,
    isNewOrReactivation = false,
    isFirstSection = false,
}: TaxObjectFormProps) {
    const getFieldError = (fieldName: string) => {
        const errorObj = get(errors, `${prefix}.${fieldName}`);
        return errorObj?.message as string | undefined;
    };

    const nopErr = getFieldError('nop');
    const addressErr = getFieldError('address');
    const blockErr = getFieldError('block');
    const rtErr = getFieldError('neighborhoodUnit');
    const rwErr = getFieldError('communityUnit');
    const subdistrictErr = getFieldError('subdistrict');
    const villageErr = getFieldError('village');
    const landAreaErr = getFieldError('landArea');
    const buildingAreaErr = getFieldError('buildingArea');
    const certificateErr = getFieldError('certificate');
    const reqNopErr = get(errors, 'requestedNop')?.message as string | undefined;

    const isLandAreaRequired = isRequestedData || !isNewOrReactivation;
    const isCertRequired = isRequestedData || !isNewOrReactivation;

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 ${isFirstSection ? '' : 'border-t border-slate-200'}`}>
            <div className="lg:col-span-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            </div>

            <div className="lg:col-span-8 space-y-4">
                {!isRequestedData ? (
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Nomor Objek Pajak <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            maxLength={24}
                            {...register(`${prefix}.nop` as const)}
                            onChange={(e) => {
                                const formatted = formatNopInput(e.target.value);
                                if (setValue) {
                                    setValue(`${prefix}.nop`, formatted, { shouldValidate: true });
                                }
                            }}
                            placeholder="36.19.150.008.009.0867-0"
                            className={`w-full bg-slate-50 border font-mono ${nopErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all tracking-wider`}
                        />
                        {nopErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{nopErr}</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Nomor Objek Pajak <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={24}
                            {...register('requestedNop')}
                            onChange={(e) => {
                                const formatted = formatNopInput(e.target.value);
                                if (setValue) {
                                    setValue('requestedNop', formatted, { shouldValidate: true });
                                }
                            }}
                            placeholder="36.19.150.008.009.0867-0"
                            className={`w-full bg-slate-50 border font-mono ${reqNopErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {reqNopErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{reqNopErr}</p>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                        Alamat Objek Pajak{' '}
                        {isRequestedData ? (
                            <span className="text-rose-500">*</span>
                        ) : (
                            <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        )}
                    </label>
                    <textarea
                        rows={2}
                        {...register(`${prefix}.address` as const)}
                        placeholder="Jl. Pahlawan B2 No. 10"
                        className={`w-full bg-slate-50 border ${addressErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                            } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all resize-none`}
                    />
                    {addressErr && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{addressErr}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Blok Objek <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.block` as const)}
                            placeholder="B2"
                            className={`w-full bg-slate-50 border ${blockErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {blockErr && (
                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{blockErr}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            RT Objek <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.neighborhoodUnit` as const)}
                            placeholder="002"
                            className={`w-full bg-slate-50 border ${rtErr ? 'border-rose-400' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {rtErr && (
                            <p className="text-[11px] text-rose-500 mt-1">{rtErr}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            RW Objek <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.communityUnit` as const)}
                            placeholder="006"
                            className={`w-full bg-slate-50 border ${rwErr ? 'border-rose-400' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {rwErr && (
                            <p className="text-[11px] text-rose-500 mt-1">{rwErr}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Kecamatan Objek{' '}
                            {isRequestedData ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.subdistrict` as const)}
                            placeholder="Sukamaju"
                            className={`w-full bg-slate-50 border ${subdistrictErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {subdistrictErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{subdistrictErr}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Kelurahan / Desa Objek{' '}
                            {isRequestedData ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.village` as const)}
                            placeholder="Mekar Asri"
                            className={`w-full bg-slate-50 border ${villageErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {villageErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{villageErr}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Luas Tanah (m²){' '}
                            {isLandAreaRequired ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <div className="flex rounded-sm border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-[#00a389]">
                            <input
                                type="number"
                                step="any"
                                {...register(`${prefix}.landArea` as const)}
                                placeholder="120"
                                className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                            />
                            <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 text-xs font-semibold border-l border-slate-200">
                                m²
                            </span>
                        </div>
                        {landAreaErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{landAreaErr}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Luas Bangunan (m²){' '}
                            {isRequestedData ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <div className="flex rounded-sm border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-[#00a389]">
                            <input
                                type="number"
                                step="any"
                                {...register(`${prefix}.buildingArea` as const)}
                                placeholder="45 (isi 0 jika tanah kosong)"
                                className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                            />
                            <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 text-xs font-semibold border-l border-slate-200">
                                m²
                            </span>
                        </div>
                        {buildingAreaErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{buildingAreaErr}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                        Bukti Kepemilikan{' '}
                        {isCertRequired ? (
                            <span className="text-rose-500">*</span>
                        ) : (
                            <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        )}
                    </label>
                    <input
                        type="text"
                        {...register(`${prefix}.certificate` as const)}
                        placeholder="SHM No. 12345/2023"
                        className={`w-full bg-slate-50 border ${certificateErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                            } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                    />
                    {certificateErr && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{certificateErr}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
