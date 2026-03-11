import React from "react";
import { useNavigate } from "react-router-dom";

const AuthLayout = ({ children, title }) => {
  const navigate = useNavigate();
  return (
    // Menggunakan mesh-gradient agar transisi dari Welcome Page terasa seamless
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full relative">
        {/* Dekorasi Aksen di belakang kartu (opsional untuk kedalaman) */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-givsum-accent/20 blur-[60px] rounded-full" />

        {/* Kartu Utama */}
        <div className="relative bg-givsum-bg rounded-[3.5rem] p-10 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Header Area */}
          {/* Header Area: Logo di Kiri, Tombol Kembali di Kanan */}
          <div className="flex justify-between items-start mb-12">
            {/* Tombol Kembali (Sekarang di sisi kanan) */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-givsum-text/40 hover:text-givsum-accent transition-all duration-300 group cursor-pointer mt-2"
            >
              <div className="w-8 h-8 rounded-full border border-givsum-text/10 flex items-center justify-center group-hover:border-givsum-accent transition-colors">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Kembali
              </span>
            </button>
            <div className="w-14 h-14 bg-givsum-text rounded-2xl flex items-center justify-center -rotate-6 shadow-lg">
              <span className="text-givsum-bg font-black text-2xl">S</span>
            </div>
          </div>

          {/* Title dengan style Bento: Extra Bold & Tight */}
          <h2 className="text-5xl font-black text-givsum-text tracking-tighter leading-[0.9] mb-10">
            {title}
            <span className="text-givsum-accent">.</span>
          </h2>

          {/* Konten Form */}
          <div className="relative z-10">{children}</div>

          {/* Efek Grain/Tekstur Halus (Opsional untuk estetika) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        {/* Footer info di luar kartu */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">
            SIPETRA Digital Tax Administration
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
