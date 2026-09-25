import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-xs p-8 rounded-sm border border-slate-100 shadow-xs animate-fadeIn">
                <div className="relative flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#00a389] animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-semibold text-slate-700">Memuat Halaman...</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Mohon tunggu sebentar</p>
                </div>

            </div>
        </div>
    )
}