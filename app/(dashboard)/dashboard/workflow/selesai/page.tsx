"use client";

import React from 'react';
import { CheckCircle2, Award, FileCheck2, Send, Download } from 'lucide-react';

export default function SelesaiPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Tahap 7 (Arsip / Output)
            </span>
            <span className="text-xs font-semibold text-slate-500">Alur Pelayanan SIPETRA</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">7. Permohonan Selesai</h1>
          <p className="text-sm text-slate-600">
            Pengajuan telah selesai diproses, dokumen output (SK/Surat Ketetapan) diterbitkan, dan WP diinformasikan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Selesai</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">128</p>
          <p className="text-xs text-slate-500">Permohonan rampung bulan ini.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kepatuhan SLA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">96.8%</p>
          <p className="text-xs text-slate-500">Selesai ≤ 10 hari kerja.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Dokumen Output</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">SK Terbit</p>
          <p className="text-xs text-slate-500">Siap diunduh oleh WP / Petugas.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifikasi WP</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">Terkirim</p>
          <p className="text-xs text-slate-500">Via WhatsApp / Email / Portal.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Download className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">Arsip Permohonan & Dokumen Output</h3>
          <p className="text-xs text-slate-500">
            Daftar permohonan yang telah terbit SK dan rampung. Anda dapat mengunduh dokumen resmi dan melihat audit trail lengkap.
          </p>
        </div>
      </div>
    </div>
  );
}
