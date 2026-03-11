import React from "react";
import { useNavigate } from "react-router-dom";
import { useSystemStatus } from "../../hooks/useSystemStatus";

const WelcomePage = () => {
  const navigate = useNavigate();

  // Destructuring semua field yang dikembalikan oleh hook
  const { version, server, database, api, uptime, timestamp, loading } =
    useSystemStatus();

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 antialiased">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Box 1: Brand & Logo */}
        <div className="md:col-span-8 bg-givsum-bg rounded-[3rem] p-10 flex flex-col justify-between min-h-[350px] shadow-2xl">
          <div className="w-16 h-16 bg-givsum-text rounded-2xl flex items-center justify-center rotate-3 shadow-xl">
            <span className="text-givsum-bg font-black text-3xl">S</span>
          </div>
          <div>
            <h1 className="text-6xl font-black text-givsum-text tracking-tighter leading-none mb-4">
              SIPETRA<span className="text-givsum-accent">.</span>
            </h1>
            <p className="text-givsum-text/70 font-bold max-w-sm text-lg leading-relaxed">
              Sistem pelayanan pajak daerah yang efektif, terpantau dan rapi.
            </p>
          </div>
        </div>

        {/* Box 2: Login Action */}
        <div
          onClick={() => navigate("/login")}
          className="md:col-span-4 bg-givsum-accent rounded-[3rem] p-8 flex flex-col justify-end cursor-pointer group hover:scale-[1.02] transition-transform duration-500 shadow-2xl"
        >
          <div className="mb-4 text-white font-black text-4xl leading-tight group-hover:translate-x-2 transition-transform">
            Mulai <br /> Sesi
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center self-end shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </div>

        {/* Box 3: Register Action */}
        <div
          onClick={() => navigate("/register")}
          className="md:col-span-5 bg-givsum-input rounded-[3rem] p-8 flex items-center justify-between cursor-pointer hover:bg-white transition-colors duration-500 shadow-xl"
        >
          <span className="text-givsum-text font-black text-xl tracking-tight uppercase">
            Daftar Akun
          </span>
          <div className="w-10 h-10 border-2 border-givsum-text/20 rounded-full flex items-center justify-center font-bold text-givsum-text">
            +
          </div>
        </div>

        {/* Box 4: Info/Status (Bento Logic Terintegrasi) */}
        <div className="md:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 flex flex-col justify-between text-white/40 shadow-2xl">
          {/* Baris Atas: Version & Uptime */}
          <div className="flex justify-between items-start w-full">
            <div className="flex gap-8">
              {/* Version */}
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">
                  Version
                </span>
                <span
                  className={`text-white/60 font-mono text-xs ${loading ? "animate-pulse" : ""}`}
                >
                  {version}
                </span>
              </div>
              {/* Uptime */}
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">
                  Uptime
                </span>
                <span className="text-white/60 font-mono text-xs">
                  {uptime ? `${(uptime / 60).toFixed(1)}m` : "0.0m"}
                </span>
              </div>
            </div>

            {/* API Health Chip */}
            <div
              className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
                api === "Healthy"
                  ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                  : "border-red-500/20 text-red-400 bg-red-500/5"
              }`}
            >
              API: {api || "Checking"}
            </div>
          </div>

          {/* Baris Bawah: Database & Server */}
          <div className="flex justify-between items-end w-full pt-4 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">
                Database Instance
              </span>
              <span
                className={`text-sm font-bold tracking-tight transition-colors duration-500 ${
                  database === "Connected" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {database}
              </span>
            </div>

            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className="text-[9px] font-black tracking-[0.2em] uppercase opacity-40 leading-none mb-1">
                  {server} Mode
                </p>
                <span className="text-[8px] font-mono text-white/20">
                  {timestamp
                    ? new Date(timestamp).toLocaleTimeString()
                    : "--:--:--"}
                </span>
              </div>
              {/* Dot Indicator */}
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 shadow-[0_0_15px] ${
                  server === "Online"
                    ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse"
                    : "bg-red-500 shadow-red-500/50"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
