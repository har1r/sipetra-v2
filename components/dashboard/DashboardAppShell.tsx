"use client";

import React, { useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { X, Sparkles } from 'lucide-react';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import NotificationSystem from '@/components/shared/NotificationSystem';

// ==================== CONSTANTS ====================
const ROLE_COOKIE_NAME = 'architax_user_role';

// ==================== PERSONAL PROFILE DRAWER ====================
function PersonalProfileDrawer({
  isOpen,
  onClose,
  session,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}) {
  if (!isOpen) return null;

  return (
    <div
      id="profile-backdrop"
      className="fixed inset-0 bg-black/30 backdrop-blur-xs flex justify-end z-50"
      onClick={onClose}
    >
      <div
        className="w-80 h-full bg-white shadow-2xl p-6 border-l border-gray-100 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800">Personal Workspace Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-2.5 select-none pt-4">
          <div className="w-20 h-20 rounded-full bg-[#ffedd5] text-[#9a3412] flex items-center justify-center text-2xl font-bold ring-4 ring-orange-100 shadow-inner">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">{session?.user?.name || 'User'}</h4>
            <p className="text-xs text-gray-400 font-bold capitalize tracking-wider mt-0.5">
              {session?.user?.email || ''}
            </p>
            <div className="mt-1.5 inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize">
              {(session?.user as any)?.role || 'USER'}
            </div>
          </div>
        </div>

        <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl space-y-1">
          <div className="flex items-center gap-1 text-violet-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold capitalize tracking-wider">Architax Dashboard</span>
          </div>
          <p className="text-[11px] text-violet-600 font-medium leading-relaxed">
            Platform manajemen permohonan berbasis Next.js + Prisma + MongoDB.
          </p>
        </div>

        <button
          onClick={() => {
            document.cookie = `${ROLE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            signOut({ callbackUrl: '/login' });
          }}
          className="mt-auto w-full text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md hover:shadow-lg"
        >
          Sign out (keluar)
        </button>
      </div>
    </div>
  );
}

// ==================== INNER DASHBOARD CONTENT ====================
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Sync role to cookie for SSR awareness
  useEffect(() => {
    if (session?.user && (session.user as any).role) {
      const role = (session.user as any).role;
      const currentCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${ROLE_COOKIE_NAME}=`))
        ?.split('=')[1];
      if (currentCookie !== role) {
        document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }, [session]);

  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    setIsPersonalProfileDrawerOpen,
  } = useDashboard();

  const handleCloseProfile = useCallback(() => {
    setIsPersonalProfileDrawerOpen(false);
  }, [setIsPersonalProfileDrawerOpen]);

  return (
    <div
      id="app-root"
      className="flex bg-white min-h-screen text-slate-800 font-sans relative overflow-x-hidden antialiased"
    >
      {/* GLOBAL NOTIFICATION TOASTS */}
      <NotificationSystem />

      {/* MOBILE SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-40 bg-black/40 md:hidden flex"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 max-w-[80vw] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <main
        id="main-content-pane"
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#f3f6f8]"
      >
        <Header />
        <div
          id="page-content-container"
          className="flex-1 px-4 sm:px-5 md:px-5 py-6 w-full pb-16"
        >
          {children}
        </div>
      </main>

      {/* PERSONAL PROFILE DRAWER */}
      <PersonalProfileDrawer
        isOpen={isPersonalProfileDrawerOpen}
        onClose={handleCloseProfile}
        session={session}
      />
    </div>
  );
}

// ==================== MAIN EXPORT ====================
export default function DashboardAppShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}
