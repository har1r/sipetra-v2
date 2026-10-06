"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Menu, X } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function Header() {
  const { searchQuery, setSearchQuery, setIsMobileMenuOpen } = useDashboard();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const mainPane = document.getElementById('main-content-pane');

    const handleScroll = () => {
      const scrollTop = mainPane ? mainPane.scrollTop : window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    handleScroll();

    if (mainPane) {
      mainPane.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (mainPane) {
        mainPane.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 flex flex-col w-full relative">
      <header
        id="top-nav-bar"
        className={`bg-[#f3f6f8] px-4 sm:px-5 md:px-5 pt-3 pb-2.5 flex items-center justify-between shrink-0 select-none transition-all duration-200 ${
          isScrolled ? 'border-b border-slate-200/80 shadow-3xs' : 'border-b border-transparent'
        }`}
      >
        {isMobileSearchOpen ? (
          <div className="flex sm:hidden items-center gap-1.5 w-full animate-in fade-in duration-150">
            <div className="relative flex-1 h-[34px] flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Workspace..."
                autoFocus
                className="w-full h-[34px] bg-white border border-slate-200 focus:border-[#00a389] focus:ring-1 focus:ring-[#00a389] rounded-sm pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none shadow-3xs"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsMobileSearchOpen(false);
              }}
              className="p-1.5 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              title="Tutup Pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: Mobile Hamburger & Desktop Search Input */}
            <div className="flex items-center gap-2 sm:gap-2.5 sm:w-[300px] md:w-[340px] lg:w-[380px]">
              <button
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 rounded-sm text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                title="Buka Menu Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop / Tablet Search Input */}
              <div className="hidden sm:flex w-full relative h-[36px] items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={session?.user?.name ? `Search ${session.user.name}'s Workspace` : "Search Workspace"}
                  className="w-full h-[36px] bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00a389] focus:ring-1 focus:ring-[#00a389] rounded-sm pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-3xs"
                />
              </div>
            </div>

            {/* Right: Mobile Search Icon + Compact Nominal Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile Search Icon Button (No background color, ghost style) */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="sm:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-sm transition-colors cursor-pointer"
                title="Cari di Workspace"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Compact Nominal Box */}
              <button className="h-[34px] px-2.5 sm:px-3 bg-[#00a389] hover:bg-[#008f78] text-white font-semibold font-mono text-[11px] sm:text-xs rounded-sm transition-all shadow-xs cursor-pointer flex items-center gap-1.5 tracking-tight whitespace-nowrap">
                <span>Rp. 345.567.376.000</span>
              </button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

