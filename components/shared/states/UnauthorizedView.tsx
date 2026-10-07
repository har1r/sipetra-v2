import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import {
  StageKey,
  STAGE_CONFIGS,
  getDefaultStageForRole,
} from '@/lib/rbac';

interface UnauthorizedViewProps {
  stage?: StageKey;
  customTitle?: string;
  customDescription?: string;
  requiredRoleLabel?: string;
  userRole?: string | null;
}

export function UnauthorizedView({
  stage,
  customTitle,
  customDescription,
  userRole,
}: UnauthorizedViewProps) {
  const stageConfig = stage ? STAGE_CONFIGS[stage] : null;
  const stageTitle = customTitle || (stageConfig ? `Tahapan ${stageConfig.label}` : 'Akses Halaman Dibatasi');
  const stageDesc =
    customDescription ||
    'Anda tidak memiliki kewenangan untuk mengakses tahapan ini.';

  const myDefaultStage = getDefaultStageForRole(userRole);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="flex flex-col items-center justify-center text-center max-w-xl w-full">
        {/* Gambar Unauthorized Berukuran Lebih Besar & Presisi di Tengah */}
        <div className="relative w-[360px] h-[270px] sm:w-[460px] sm:h-[345px] md:w-[500px] md:h-[375px] max-w-full">
          <Image
            src="/Unauthorize.jpeg"
            alt="Unauthorized"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            priority
            className="object-contain"
          />
        </div>

        {/* Teks Penjelasan Ringkas */}
        <div className="text-center mt-4 mb-6 space-y-1.5 max-w-md px-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            {stageTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {stageDesc}
          </p>
        </div>

        {/* 2 Tombol Aksi di Bawahnya */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            href="/dashboard/home"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-sm border border-slate-300 transition-colors cursor-pointer shadow-2xs"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          {myDefaultStage.href !== '/dashboard/home' && (
            <Link
              href={myDefaultStage.href}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-xs sm:text-sm rounded-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>Buka Tahapan Saya ({myDefaultStage.label})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
