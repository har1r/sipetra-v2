import React from "react";

const Button = ({
  children,
  type = "button",
  onClick,
  loading = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-5 px-8 rounded-full font-black text-white text-sm uppercase tracking-widest
      bg-givsum-accent hover:translate-y-[-2px] active:scale-[0.96]
      shadow-[0_15px_30px_-10px_rgba(255,114,94,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(255,114,94,0.6)]
      transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="animate-pulse">Processing</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
