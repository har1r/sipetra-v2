'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Page Error:', error);
    }, [error]);

    return (
        <div className="w-full min-h-[450px] flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <AlertCircle className="w-7 h-7" />
                </div>

                <span className="inline-block text-[11px] font-bold tracking-wider text-rose-700 uppercase bg-rose-50 px-3 py-0.5 rounded-full mb-3">
                    Error Pada Modul Ini
                </span>

                <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Gagal Memuat Konten Dashboard
                </h2>

                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {error.message || 'Terjadi kesalahan saat memproses data pada halaman ini. Anda dapat mencoba memuat ulang modul atau kembali ke Beranda.'}
                </p>

                {error.digest && (
                    <div className="mb-6 py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs font-mono text-slate-400 inline-block">
                        ID: {error.digest}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008f78] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-[#00a389]/20 cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Coba Muat Ulang
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
    );
}
