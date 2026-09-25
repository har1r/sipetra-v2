import { Loader2 } from "lucide-react";

export default function DashboardSubLoading() {
    return (
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00a389] animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Memuat data dashboard...</p>
        </div>
    );
};