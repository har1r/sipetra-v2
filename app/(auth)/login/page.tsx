"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

const PRESET_ACCOUNTS = [
  {
    role: 'Penginput',
    email: 'penginput@architax.com',
    color: 'bg-emerald-50 text-[#008f78] border-emerald-200 hover:bg-emerald-100',
    badge: 'Fase 1',
    description: 'Penerimaan Data',
  },
  {
    role: 'Peneliti',
    email: 'peneliti@architax.com',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    badge: 'Fase 2',
    description: 'Verifikasi Berkas',
  },
  {
    role: 'Pengarsip',
    email: 'pengarsip@architax.com',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    badge: 'Fase 3',
    description: 'Digitalisasi PDF',
  },
  {
    role: 'Pengirim',
    email: 'pengirim@architax.com',
    color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    badge: 'Fase 4',
    description: 'Manifest Kirim',
  },
  {
    role: 'Pemantau',
    email: 'pemantau@architax.com',
    color: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
    badge: 'Fase 5',
    description: 'Pemantauan Status',
  },
  {
    role: 'Supervisor',
    email: 'supervisor@architax.com',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    badge: 'Lintas',
    description: 'Supervisi & Approval',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });
      if (res?.error) {
        setError(res.error || 'Email atau password salah');
        setLoading(false);
      } else {
        router.push('/dashboard/home');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setLoading(true);
    setError('');
    setEmail(presetEmail);
    setPassword('password123');
    try {
      const res = await signIn('credentials', {
        email: presetEmail,
        password: 'password123',
        redirect: false,
      });
      if (res?.error) {
        setError(res.error || 'Gagal masuk secara otomatis');
        setLoading(false);
      } else {
        router.push('/dashboard/home');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between items-center p-4 sm:p-6 antialiased select-none">
      <BackButton />
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xs flex flex-col gap-5 animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 shrink-0">
            <svg
              viewBox="34 34 132 132"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <g transform="translate(100,100) rotate(-8)">
                <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6" />
                <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4" />
                <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355" />
                <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC" />
              </g>
              <circle cx="100" cy="100" r="6" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
              Masuk ke Akun SIPETRA
            </h1>
            <p className="text-xs text-slate-500 font-normal font-sans">
              Badan Pendapatan Daerah Kabupaten Tangerang
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-start gap-2 font-sans animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 font-sans">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="nama@architax.com"
                className="w-full h-10 pl-9 pr-3 bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-xl text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-700 font-sans">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Masukkan password Anda"
                className="w-full h-10 pl-9 pr-3 bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] focus:ring-2 focus:ring-[#00a389]/10 rounded-xl text-[13px] font-normal text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs font-sans"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-1 bg-[#00a389] hover:bg-[#008f78] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-[#00a389]/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <span>Masuk Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Login Simulasi Peran */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-800 font-sans">
              Quick Login (Simulasi Peran)
            </span>
            <span className="text-[10px] font-semibold text-[#008f78] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans">
              1-Klik Otomatis
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-sans">
            {PRESET_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
                className={`p-2 px-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer shadow-3xs hover:scale-[1.01] ${acc.color}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold truncate">{acc.role}</span>
                  <span className="text-[8px] font-extrabold uppercase">{acc.badge}</span>
                </div>
                <span className="text-[9px] opacity-80 font-normal truncate">
                  {acc.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-400">
          Badan Pendapatan Daerah Kabupaten Tangerang © 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}
