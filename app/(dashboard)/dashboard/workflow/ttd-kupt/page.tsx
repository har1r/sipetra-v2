"use client";

import React from 'react';
import { FileCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function TtdKUPTPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Tahap 4 (SLA 2 Hari)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">4. TTD KUPT</h1>
          <p className="text-sm text-slate-600">
            Kepala UPT (KUPT) menilai permohonan dan menandatangani secara digital (TTE).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Waktu SLA</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Max 2 Hari Kerja</p>
          <p className="text-xs text-slate-500">Persetujuan akhir Kepala UPT.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Otorisasi</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Menilai, Tidak Mengedit</p>
          <p className="text-xs text-slate-500">Persetujuan tanda tangan digital (TTE).</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revisi Internal</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Kembali ke Petugas</p>
          <p className="text-xs text-slate-500">Alasan penolakan/revisi internal wajib diisi.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <FileCheck className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Antrean TTD Kepala UPT</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang telah diparaf KTU dan menunggu penandatanganan KUPT.
          </p>
        </div>
      </div>
    </div>
  );
}
