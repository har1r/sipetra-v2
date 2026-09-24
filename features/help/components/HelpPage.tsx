import { HelpCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 select-none">
        <HelpCircle className="w-6 h-6 text-indigo-500 shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Workspace Support Center</h2>
          <p className="text-xs text-gray-400 font-medium">Panduan dan pertanyaan umum seputar dashboard Architax.</p>
        </div>
      </div>
      <div className="space-y-4">
        {[
          {
            q: 'Apakah dashboard ini interaktif?',
            a: 'Ya! Navigasi sidebar bisa diklik untuk berpindah antar halaman. Fitur-fitur akan dibangun secara bertahap.'
          },
          {
            q: 'Bagaimana cara mengajukan permohonan baru?',
            a: 'Masuk ke halaman "Tugas Saya" dan pilih tombol buat permohonan baru. Fitur ini sedang dalam pembangunan.'
          },
        ].map(({ q, a }, i) => (
          <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
            <h3 className="text-xs font-bold text-gray-800 mb-1">{q}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
