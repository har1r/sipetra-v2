'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, get } from 'react-hook-form';

interface TaxSubjectFormProps {
    prefix: string;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    title?: string;
    isCorrection?: boolean;
    isRequestedData?: boolean;
    isNewOrReactivation?: boolean;
    isFirstSection?: boolean;
}

export function TaxSubjectForm({
    prefix,
    register,
    errors,
    title = 'Informasi Subjek Pajak',
    isRequestedData = true,
    isNewOrReactivation = false,
    isFirstSection = false,
}: TaxSubjectFormProps) {
    const getFieldError = (fieldName: string) => {
        const errorObj = get(errors, `${prefix}.${fieldName}`);
        return errorObj?.message as string | undefined;
    };

    const nameErr = getFieldError('name');
    const waErr = getFieldError('whatsappNumber');
    const addressErr = getFieldError('address');
    const blockErr = getFieldError('block');
    const rtErr = getFieldError('neighborhoodUnit');
    const rwErr = getFieldError('communityUnit');
    const subdistrictErr = getFieldError('subdistrict');
    const villageErr = getFieldError('village');

    const isNameRequired = isRequestedData || !isNewOrReactivation;

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 ${isFirstSection ? '' : 'border-t border-slate-200'}`}>
            <div className="lg:col-span-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            </div>

            <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Nama Wajib Pajak{' '}
                            {isNameRequired ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.name` as const)}
                            placeholder="Ahmad Subagja"
                            className={`w-full bg-slate-50 border ${nameErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {nameErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{nameErr}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            Nomor WhatsApp{' '}
                            {isRequestedData ? (
                                <span className="text-rose-500">*</span>
                            ) : (
                                <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                            )}
                        </label>
                        <div className="flex rounded-sm border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-[#00a389]">
                            <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 text-xs font-semibold border-r border-slate-200">
                                +62
                            </span>
                            <input
                                type="text"
                                {...register(`${prefix}.whatsappNumber` as const)}
                                placeholder="81234567890"
                                className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-800 focus:outline-none"
                            />
                        </div>
                        {waErr && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">{waErr}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                        Alamat Wajib Pajak{' '}
                        {isRequestedData ? (
                            <span className="text-rose-500">*</span>
                        ) : (
                            <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        )}
                    </label>
                    <textarea
                        rows={2}
                        {...register(`${prefix}.address` as const)}
                        placeholder="Jl. Raya Kartini No. 45"
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
                            Blok <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.block` as const)}
                            placeholder="A-12"
                            className={`w-full bg-slate-50 border ${blockErr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {blockErr && (
                            <p className="text-[11px] text-rose-500 mt-1 font-medium">{blockErr}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            RT <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.neighborhoodUnit` as const)}
                            placeholder="001"
                            className={`w-full bg-slate-50 border ${rtErr ? 'border-rose-400' : 'border-slate-200'
                                } focus:bg-white focus:border-[#00a389] text-slate-800 rounded-sm px-3 py-2 text-sm transition-all`}
                        />
                        {rtErr && (
                            <p className="text-[11px] text-rose-500 mt-1">{rtErr}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold capitalize text-slate-700 mb-1.5">
                            RW <span className="text-slate-800 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...register(`${prefix}.communityUnit` as const)}
                            placeholder="005"
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
                            Kecamatan{' '}
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
                            Kelurahan / Desa{' '}
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
            </div>
        </div>
    );
}
