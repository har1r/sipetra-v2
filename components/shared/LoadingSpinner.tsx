export default function LoadingSpinner({ label = 'Menyiapkan Halaman...' }: { label?: string }) {
  return (
    <div className="w-full min-h-[520px] flex flex-col items-center justify-center gap-4 select-none pt-16">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 w-full h-full rounded-full border-[4px] border-slate-100/60" />
        <div className="absolute inset-0 w-full h-full rounded-full border-[4px] border-[#00a389] border-t-transparent animate-spin" />
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden">
          <svg viewBox="34 34 132 132" className="w-12 h-12">
            <g transform="translate(100,100)">
              <rect x="-56" y="-56" width="50" height="50" rx="12" fill="#3F72E6" />
              <rect x="6" y="-56" width="50" height="50" rx="12" fill="#0DC5B4" />
              <rect x="-56" y="6" width="50" height="50" rx="12" fill="#FF6355" />
              <rect x="6" y="6" width="50" height="50" rx="12" fill="#7C5CFC" />
            </g>
            <circle cx="100" cy="100" r="6" fill="white" />
          </svg>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 font-extrabold capitalize tracking-wider animate-pulse">
        {label}
      </span>
    </div>
  );
}
