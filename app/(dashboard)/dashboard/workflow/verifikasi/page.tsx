"use client";

import React from 'react';
import { Search, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function VerifikasiPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              Tahap 2 (SLA 2 Hari)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">2. Verifikasi Berkas</h1>
          <p className="text-sm text-slate-600">
            Petugas pemilik berkas memeriksa dan memvalidasi kelengkapan dokumen. Berkas lolos dimasukkan ke dalam Bundle.
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Waktu SLA</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Max 2 Hari Kerja</p>
          <p className="text-xs text-slate-500">Verifikasi awal maksimal 2 hari kerja.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Output Jika Lolos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Masuk Bundle</p>
          <p className="text-xs text-slate-500">Lanjut ke Tahap 3 (Paraf KTU).</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jika Data Kurang</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Perbaikan WP</p>
          <p className="text-xs text-slate-500">SLA di-pause hingga WP submit ulang (Verifikasi ulang max 1 hari).</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Antrean Verifikasi Berkas</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang menunggu pemeriksaan dan validasi dokumen oleh Petugas.
          </p>
        </div>
      </div>
    </div>
  );
}
