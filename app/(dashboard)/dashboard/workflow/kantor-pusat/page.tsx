"use client";

import React from 'react';
import { Building2, Clock, Cpu, Forward } from 'lucide-react';

export default function KantorPusatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              Tahap 6 (Luar SLA)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">6. Pemrosesan Kantor Pusat</h1>
          <p className="text-sm text-slate-600">
            Kantor Pusat menerima dan memproses pengajuan lebih lanjut untuk validasi/penetapan akhir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sifat SLA</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900">Luar SLA Internal</p>
          <p className="text-xs text-slate-500">Target SLA 10 Hari Kerja UPT telah selesai diserahterimakan.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Aktivitas</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900">Pemrosesan Pusat</p>
          <p className="text-xs text-slate-500">Integrasi & validasi penetapan tingkat pusat.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tahap Akhir</span>
            <Forward className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900">Penyampaian ke WP</p>
          <p className="text-xs text-slate-500">Setelah diproses pusat, status beralih ke Selesai.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Permohonan di Kantor Pusat</h3>
          <p className="text-xs text-slate-500">
            Daftar pengajuan yang saat ini sedang diproses oleh tim teknis Kantor Pusat.
          </p>
        </div>
      </div>
    </div>
  );
}
