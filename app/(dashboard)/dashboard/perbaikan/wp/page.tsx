import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PauseCircle, Bell, CalendarX, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Perbaikan Wajib Pajak (WP) — SIPETRA Architax',
  description: 'Daftar permohonan yang dikembalikan ke WP karena kekurangan berkas/dokumen pendukung.',
};

export default async function PerbaikanWPPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Mekanisme Perbaikan WP (Pemohon)
            </span>
            <span className="text-xs font-semibold text-slate-500">SLA 10 Hari Kerja</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Perbaikan Wajib Pajak (WP)</h1>
          <p className="text-sm text-slate-600">
            Daftar permohonan yang dikembalikan ke WP karena kekurangan berkas/dokumen pendukung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status SLA</span>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-600">SLA Dijeda (Paused)</p>
          <p className="text-xs text-slate-500">Timer SLA di-pause dan berlanjut setelah WP submit ulang.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifikasi</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">WP Diberitahu</p>
          <p className="text-xs text-slate-500">Pemberitahuan resmi dikirim ke kontak WP.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Akhir</span>
            <CalendarX className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Tahun Berjalan</p>
          <p className="text-xs text-slate-500">Jika melebihi tahun berjalan, status berubah Kadaluarsa.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Permohonan Menunggu Perbaikan WP</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang saat ini pending menunggu respons dan unggahan ulang berkas oleh Wajib Pajak.
          </p>
        </div>
      </div>
    </div>
  );
}
