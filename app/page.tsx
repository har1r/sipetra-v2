import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  FileText,
  Shield,
  Users,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'SIPETRA — Portal Pelayanan PBB-P2 Bapenda Kabupaten Tangerang',
  description:
    'Sistem Informasi Pengelolaan dan Penelusuran Berkas Pajak Daerah terintegrasi.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between antialiased select-none relative">
      {/* TOP NAVBAR */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between shadow-3xs z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 transition-all duration-300 hover:scale-105">
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
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none font-sans">
              SIPETRA <span className="text-[#00a389] font-normal text-xs ml-1">Architax</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 font-sans mt-0.5">
              Badan Pendapatan Daerah Kabupaten Tangerang
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[13px] font-normal text-slate-600 font-sans">
          <span className="text-[#00a389] font-semibold">Beranda</span>
          <span className="hover:text-slate-900 transition-colors">Layanan PBB</span>
          <span className="hover:text-slate-900 transition-colors">Petunjuk Teknis</span>
          <span className="hover:text-slate-900 transition-colors">Regulasi</span>
          <span className="hover:text-slate-900 transition-colors">Bantuan</span>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 font-sans"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Portal</span>
          </Link>
        </div>
      </header>

      {/* HERO CONTENT */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-12 py-12 sm:py-16 flex flex-col gap-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 font-sans">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#008f78] text-[11px] font-bold w-fit font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Pengelolaan Pajak Daerah Terintegrasi</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-sans">
              Cari Data &amp; Pelayanan PBB <br />
              <span className="text-[#00a389]">Mudah, Cepat, dan Akurat</span>
            </h1>
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-xl font-sans">
              Informasi data dan pelayanan resmi berkas PBB-P2 dari Badan Pendapatan Daerah Kabupaten
              Tangerang. Terintegrasi langsung dalam 5 fase pengarsipan digital.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/login"
                className="px-6 py-3 rounded-md bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 font-sans"
              >
                <span>Masuk ke Akun (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-5 py-3 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all font-sans shadow-3xs"
              >
                <span>Simulasi Quick Login</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-md p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00a389]" />
                <span className="text-xs font-bold text-slate-800">Statistik Real-time Sistem</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aktif 2026
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['75+', 'Total Pemohon'],
                ['6', 'Jenis Layanan'],
                ['100%', 'Digitalisasi'],
                ['5', 'Role Petugas'],
              ].map(([val, label], i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col gap-1"
                >
                  <span
                    className={`text-2xl font-extrabold font-mono ${
                      i === 2 ? 'text-[#00a389]' : 'text-slate-900'
                    }`}
                  >
                    {val}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium capitalize">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-[11px] text-[#007361] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00a389] shrink-0" />
              <span>Semua data terverifikasi dan siap diakses secara real-time.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/80">
          {[
            {
              icon: FileText,
              title: 'Verifikasi Berkas Presisi',
              desc: 'Penelitian berkas PBB dilakukan secara sistematis per bundle untuk meminimalisir kesalahan data.',
            },
            {
              icon: Shield,
              title: 'Digitalisasi Scan PDF',
              desc: 'Setiap berkas diunggah secara aman dan diarsipkan langsung ke server cloud Bapenda.',
            },
            {
              icon: Users,
              title: 'Tracking Manifest & Logistik',
              desc: 'Pemantauan pengiriman berkas antar fase pelayanan dapat dilacak secara real-time.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-slate-200/90 rounded-md shadow-3xs flex flex-col gap-2"
            >
              <Icon className="w-5 h-5 text-[#00a389]" />
              <h3 className="text-xs font-bold text-slate-900 capitalize">{title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-6 sm:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-normal font-sans z-10 select-none">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#00a389]" />
          <span>Badan Pendapatan Daerah Kabupaten Tangerang © 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
          <span>SIPETRA Architax Module</span>
          <span>•</span>
          <span>PRD v2.9 Final Spec</span>
        </div>
      </footer>
    </div>
  );
}
