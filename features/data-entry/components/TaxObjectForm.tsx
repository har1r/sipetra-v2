'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, get } from 'react-hook-form';

interface TaxObjectFormProps {
    prefix: string;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    title?: string;
    description?: string;
    isRequestedData?: boolean;
    isCorrection?: boolean;
}

export function TaxObjectForm({
    prefix,
    register,
    errors,
    title = 'Informasi Objek Pajak',
    description = 'Permohonan dengan jenis selain Pembetulan, maka Alamat, Blok, RT, RW, Kecamatan, Kelurahan / Desa, bukti kepemilikan objek pajak boleh tidak diisi.',
    isRequestedData = false,
    isCorrection = false,
}: TaxObjectFormProps) {
    const getFieldError = (fieldName: string) => {
        const errorObj = get(errors, `${prefix}.${fieldName}`);
        return errorObj?.message as string | undefined;
    };

    const nopErr = getFieldError('nop');
    const nopTempErr = getFieldError('nopTemporary');
    const addressErr = getFieldError('address');
    const blockErr = getFieldError('block');
    const rtErr = getFieldError('neighborhoodUnit');
    const rwErr = getFieldError('communityUnit');
    const subdistrictErr = getFieldError('subdistrict');
    const villageErr = getFieldError('village');
    const landAreaErr = getFieldError('landArea');
    const buildingAreaErr = getFieldError('buildingArea');
    const certificateErr = getFieldError('certificate');

    const isAddressRequired = isRequestedData || isCorrection;
    const isBlockRtRwRequired = isCorrection;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-200">
            <div className="lg:col-span-4 space-y-1">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>

            <div className="lg:col-span-8 space-y-4">
                {!isRequestedData ? (
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Nomor Objek Pajak <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={18}
                            {...register(`${prefix}.nop` as const)}
                            placeholder="3619XXXXXXXXXXXXXXXX"
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
                            NOP Sementara <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.nopTemporary` as const)}
                            placeholder="3619XXXXXXXXXXXXXXXX"
                            className={`w-full bg-slate-50 border font-mono ${nopTempErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {nopTempErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{nopTempErr}</p>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                        Alamat Objek Pajak <span className="text-rose-500">{isAddressRequired ? '*' : '(Opsional)'}</span>
                    </label>
                    <textarea
                        rows={2}
                        {...register(`${prefix}.address` as const)}
                        placeholder="Jl. Pahlawan Blok B2 No. 10"
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
                            Blok Objek <span className="text-rose-500">{isBlockRtRwRequired ? '*' : '(Opsional)'}</span>
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
                            RT Objek <span className="text-rose-500">{isBlockRtRwRequired ? '*' : '(Opsional)'}</span>
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
                            RW Objek <span className="text-rose-500">{isBlockRtRwRequired ? '*' : '(Opsional)'}</span>
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
                            Kecamatan Objek <span className="text-rose-500">{isAddressRequired ? '*' : '(Opsional)'}</span>
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
                            Kelurahan / Desa Objek <span className="text-rose-500">{isAddressRequired ? '*' : '(Opsional)'}</span>
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
                            Luas Bumi (m²) <span className="text-rose-500">*</span>
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
                            Luas Bangunan (m²) <span className="text-rose-500">*</span>
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
                        Bukti Kepemilikan <span className="text-rose-500">{isRequestedData ? '*' : '(Opsional)'}</span>
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
