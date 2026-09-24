import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 select-none">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00a389] to-[#0DC5B4] flex items-center justify-center shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Selamat Datang di SIPETRA</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Dashboard sedang disiapkan. Gunakan navigasi di sidebar untuk berpindah halaman.
        </p>
      </div>
    </div>
  );
}
