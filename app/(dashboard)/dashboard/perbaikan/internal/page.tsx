"use client";

import React from 'react';
import { AlertCircle, RotateCcw, Clock, ShieldAlert } from 'lucide-react';

export default function PerbaikanInternalPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              Mekanisme Perbaikan Internal
            </span>
            <span className="text-xs font-semibold text-slate-500">SLA 10 Hari Kerja</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Perbaikan Internal</h1>
          <p className="text-sm text-slate-600">
            Daftar permohonan yang dikembalikan oleh KTU, KUPT, atau Pengiriman ke Petugas Verifikasi karena kesalahan internal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status SLA</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-rose-600">SLA Tetap Berjalan</p>
          <p className="text-xs text-slate-500">Waktu SLA tidak di-pause. Memakan 1 hari cadangan revisi.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ketentuan Mandatory</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Alasan Wajib Diisi</p>
          <p className="text-xs text-slate-500">Pemeriksa wajib menyertakan catatan perbaikan.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tindakan Petugas</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">Perbaiki & Submit Ulang</p>
          <p className="text-xs text-slate-500">Petugas memperbaiki data dan mengirim kembali.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Antrean Perbaikan Internal</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang membutuhkan tindakan perbaikan cepat dari Petugas Verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
