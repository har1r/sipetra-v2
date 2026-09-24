import { Inbox } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 flex flex-col gap-6 w-full shadow-sm max-w-3xl mx-auto select-none">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-indigo-500" /> Kotak Masuk
        </h2>
        <p className="text-xs text-gray-400 font-medium">Notifikasi dan pesan masuk akan tampil di sini.</p>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-gray-500">Belum ada pesan</p>
        <p className="text-xs text-gray-400 mt-1">Fitur ini sedang dalam pembangunan.</p>
      </div>
    </div>
  );
}
