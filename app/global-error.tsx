'use client';

import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="id">
            <body className="antialiased font-sans bg-slate-100 min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertOctagon className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        Terjadi Kesalahan Kritis
                    </h1>

                    <p className="text-sm text-slate-500 mb-6">
                        Terjadi masalah pada sistem utama aplikasi.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Muat Ulang Aplikasi
                    </button>
                </div>
            </body>
        </html>
    );
}
