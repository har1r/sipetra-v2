"use client";

import React from 'react';
import { PenTool, Clock, Eye, AlertCircle } from 'lucide-react';

export default function ParafKTUPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Tahap 3 (SLA 2 Hari)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">3. Paraf KTU</h1>
          <p className="text-sm text-slate-600">
            Kepala Tata Usaha (KTU) menilai berkas pengajuan tanpa melakukan pengeditan langsung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Waktu SLA</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Max 2 Hari Kerja</p>
          <p className="text-xs text-slate-500">KTU menilai kelayakan berkas.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prinsip Evaluasi</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Menilai, Tidak Mengedit</p>
          <p className="text-xs text-slate-500">Integritas dokumen dijaga ketat.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jika Ditemukan Kesalahan</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Perbaikan Internal</p>
          <p className="text-xs text-slate-500">Dikembalikan ke Petugas (Alasan wajib diisi, SLA tetap jalan).</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <PenTool className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Antrean Paraf Kepala Tata Usaha (KTU)</h3>
          <p className="text-xs text-slate-500">
            Daftar bundle berkas permohonan yang siap untuk ditinjau dan diparaf oleh KTU.
          </p>
        </div>
      </div>
    </div>
  );
}
