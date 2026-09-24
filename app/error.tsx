'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from "next/link";

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void
}) {
    useEffect(() => {
        console.error("Application Runtime Error:", error)
    }, [error]);

    return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='max-w-md w-full text-center bg-white p-8 rounded-sm shadow-xs border border-slate-100 animate-fadeIn'>
                <div className='w-16 h-16 bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center mx-auto mb-5'>
                    <AlertTriangle className='w-8 h-8' />
                </div>

                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full">
                    Terjadi Kesalahan
                </span>

                <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">
                    Ups! Terjadi Masalah
                </h1>

                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {error.message || 'Sistem mengalami kendala saat memproses permintaan Anda.'}
                </p>

                {error.digest && (
                    <div className="mb-6 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs font-mono text-slate-400">
                        Digest ID: {error.digest}
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Coba Lagi
                    </button>
                    <Link
                        href="/dashboard/home"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    )
}