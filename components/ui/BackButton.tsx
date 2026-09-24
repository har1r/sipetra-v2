'use client';

import { ArrowLeft } from "lucide-react";

export function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
            <ArrowLeft className="w-4 h-4" />
            Kembali
        </button>
    )
}