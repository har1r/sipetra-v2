import { FileClock } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-sm select-none">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FileClock className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-1">Riwayat</h3>
      <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto">
        Riwayat permohonan yang telah diproses akan ditampilkan di sini.
      </p>
    </div>
  );
}
