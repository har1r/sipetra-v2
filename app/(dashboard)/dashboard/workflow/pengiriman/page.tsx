import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Send, Clock, CheckSquare, PackageCheck } from 'lucide-react';
import { UnauthorizedView } from '@/components/shared/states/UnauthorizedView';
import { hasStageAccess } from '@/lib/rbac';

export const metadata = {
  title: 'Pengiriman Berkas — SIPETRA Architax',
  description: 'Pengecekan kelengkapan akhir dokumen oleh Pengirim sebelum diserahkan ke Kantor Pusat.',
};

export default async function PengirimanPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  if (!hasStageAccess(session.user.role, 'pengiriman')) {
    return <UnauthorizedView stage="pengiriman" userRole={session.user.role} />;
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Tahap 5 (SLA 3 Hari)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">5. Pengiriman (Cek Kelengkapan Akhir)</h1>
          <p className="text-sm text-slate-600">
            Pengecekan kelengkapan akhir dokumen oleh Pengirim sebelum diserahkan ke Kantor Pusat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Waktu SLA</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Max 3 Hari Kerja</p>
          <p className="text-xs text-slate-500">Persiapan manifest & pengiriman akhir.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengecekan</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Cek Akhir</p>
          <p className="text-xs text-slate-500">Memastikan tidak ada berkas tertinggal.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Tujuan</span>
            <PackageCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Kantor Pusat</p>
          <p className="text-xs text-slate-500">Akhir perhitungan SLA 10 Hari Kerja internal.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Send className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Antrean Pengiriman ke Kantor Pusat</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang telah di-TTD KUPT dan siap dikirimkan ke Kantor Pusat.
          </p>
        </div>
      </div>
    </div>
  );
}
