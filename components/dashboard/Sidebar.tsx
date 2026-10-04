"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import {
  Home,
  FilePlus,
  SearchCheck,
  PenTool,
  FileCheck2,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Inbox,
  Search,
  HelpCircle,
  Calendar,
  Clock,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Workflow,
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getInitials } from '@/lib/utils';

export default function Sidebar() {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    setIsPersonalProfileDrawerOpen,
    setIsMobileMenuOpen,
  } = useDashboard();

  const router = useRouter();
  const pathname = usePathname();

  const { data: session, status: sessionStatus } = useSession();
  const isSessionLoading = sessionStatus === 'loading';
  const userName = session?.user?.name || '';
  const userRoleRaw = (session?.user as any)?.role || '';

  const firstName = useMemo(() => {
    if (!userName?.trim()) return '';
    return userName.trim().split(/\s+/)[0];
  }, [userName]);

  const userInitials = useMemo(() => getInitials(userName), [userName]);

  const userRoleFormatted = useMemo(() => {
    if (!userRoleRaw) return 'Starter Plan';
    return userRoleRaw.charAt(0).toUpperCase() + userRoleRaw.slice(1).toLowerCase();
  }, [userRoleRaw]);

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Hover state for Collapsed Popovers / Tooltips
  const [activePopover, setActivePopover] = useState<'workflow' | string | null>(null);

  const navigate = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
    setActivePopover(null);
  };

  // MODEL 2: 7 WORKFLOW STEPS DATA (TIMELINE STEPPER 1-7)
  const workflowSteps = [
    { stepNum: 1, id: 'pengajuan', label: 'Pengajuan', href: '/dashboard/workflow/submission', icon: FilePlus, sla: 'Luar SLA' },
    { stepNum: 2, id: 'verifikasi', label: 'Verifikasi', href: '/dashboard/workflow/verification', icon: SearchCheck, sla: '2 Hari' },
    { stepNum: 3, id: 'paraf-ktu', label: 'Paraf KTU', href: '/dashboard/workflow/paraf-ktu', icon: PenTool, sla: '2 Hari' },
    { stepNum: 4, id: 'ttd-kupt', label: 'TTD KUPT', href: '/dashboard/workflow/ttd-kupt', icon: FileCheck2, sla: '2 Hari' },
    { stepNum: 5, id: 'pengiriman', label: 'Pengiriman', href: '/dashboard/workflow/pengiriman', icon: Send, sla: '3 Hari' },
    { stepNum: 6, id: 'kantor-pusat', label: 'Kantor Pusat', href: '/dashboard/workflow/kantor-pusat', icon: Building2, sla: 'Luar SLA' },
    { stepNum: 7, id: 'selesai', label: 'Selesai', href: '/dashboard/workflow/selesai', icon: CheckCircle2, sla: 'Luar SLA' },
  ];

  // Perbaikan Items Data (Standalone Individual Menu Items)
  const perbaikanItems = [
    { id: 'internal', label: 'Perbaikan Internal', href: '/dashboard/perbaikan/internal', icon: AlertCircle, badgeColor: 'bg-rose-500' },
    { id: 'wp', label: 'Perbaikan WP', href: '/dashboard/perbaikan/wp', icon: PauseCircle, badgeColor: 'bg-amber-500' },
  ];

  // Utility Items Data (Standard Menu)
  const utilityItems = [
    { id: 'inbox', label: 'Kotak Masuk', href: '/dashboard/inbox', icon: Inbox },
    { id: 'audit-log', label: 'Activity Log', href: '/dashboard/audit-log', icon: Clock },
    { id: 'help', label: 'Bantuan', href: '/dashboard/help', icon: HelpCircle },
  ];

  const isWorkflowActive = pathname.startsWith('/dashboard/workflow');

  const isStepActive = (stepHref: string, stepId: string) => {
    if (pathname === stepHref || pathname.startsWith(`${stepHref}/`)) {
      return true;
    }
    if (pathname.startsWith('/dashboard/workflow/applications')) {
      if (userRoleRaw === 'VERIFICATOR' && stepId === 'verifikasi') return true;
      if (userRoleRaw === 'FRONT_OFFICER' && stepId === 'pengajuan') return true;
    }
    return false;
  };

  return (
    <aside
      id="sidebar-nav"
      style={{
        fontFamily:
          "'Karla', var(--font-karla), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
      className={`h-screen sticky top-0 border-r border-gray-300/80 flex flex-col justify-between shrink-0 select-none bg-white text-gray-900 z-40 transition-all duration-300 ${isSidebarCollapsed ? 'w-[72px] px-2 py-3.5 overflow-visible' : 'w-full md:w-[289px] md:max-w-[289px] p-4'
        }`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="md:hidden absolute top-2 right-2 p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-50"
        title="Tutup Menu"
      >
        <X className="w-5 h-5" />
      </button>

      <div className={`flex flex-col justify-between h-full w-full ${isSidebarCollapsed ? 'overflow-visible' : ''}`}>
        <div className={`flex flex-col justify-between h-full ${isSidebarCollapsed ? 'overflow-visible' : ''}`}>

          {/* ==================== TOP: Header & Collapse Toggle ==================== */}
          <div className="flex flex-col shrink-0">
            {!isSidebarCollapsed ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between h-[47px] pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-7 h-7 rounded-sm bg-[#E0E6EB] flex justify-center items-center shrink-0 shadow-xs">
                      <p className="text-center text-[11px] text-[#2D3A46] font-bold uppercase">
                        {userInitials}
                      </p>
                    </div>
                    <div className="flex flex-col max-w-[130px] truncate">
                      <span className="text-slate-900 text-[13px] font-semibold tracking-tight truncate">
                        {firstName ? `Hi, ${firstName}` : 'Hi, User'}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium leading-tight truncate capitalize">
                        {userRoleFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <NotificationBell />
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      className="hidden md:flex p-1.5 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Lipat Sidebar"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Clock & Date Widget (Expanded Only) */}
                <div className="flex flex-col gap-1.5 px-0.5">
                  <div className="relative flex items-center justify-center rounded-sm px-3 py-1.5 text-[12px] text-white bg-[#00a389] shadow-xs select-none gap-2 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-white stroke-[2.2]" />
                    <span className="font-mono text-[12px] font-bold tracking-wider">
                      {currentTime || '00:00:00'}
                    </span>
                  </div>
                  <div className="relative flex items-center justify-center rounded-sm px-2.5 py-1 border text-[11px] border-slate-200 bg-slate-50/60 text-slate-700 select-none gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate text-[11px] text-slate-600 font-medium">{todayFormatted}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CLEAN COLLAPSED HEADER */
              <div className="flex flex-col items-center justify-center gap-2 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer group shadow-2xs"
                  title="Perluas Sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-transform group-hover:scale-110" />
                </button>
              </div>
            )}
          </div>

          {/* ==================== MIDDLE: Navigation ==================== */}
          <div className={`my-3 flex-1 ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto scrollbar-none'}`}>
            {!isSidebarCollapsed ? (
              /* EXPANDED MODE NAVIGATION */
              <div className="flex flex-col gap-4 px-0.5">

                {/* SECTION 1: RANGKUMAN */}
                <div className="flex flex-col gap-1">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rangkuman
                  </span>
                  <button
                    onClick={() => navigate('/dashboard/home')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] font-medium transition-all cursor-pointer ${pathname === '/dashboard/home'
                      ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                  >
                    <Home className={`w-4 h-4 shrink-0 ${pathname === '/dashboard/home' ? 'text-slate-900 stroke-[2.2]' : 'text-slate-500'}`} />
                    <span>Beranda</span>
                  </button>
                </div>

                {/* SECTION 2: ALUR PELAYANAN (TIMELINE STEPPER 1-7 - BRANCH PATTERN) */}
                <div className="flex flex-col gap-1 relative">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tahapan Pelayanan
                    </span>
                  </div>

                  <div className="relative flex flex-col mt-1.5">
                    {workflowSteps.map((step, idx) => {
                      const Icon = step.icon;
                      const isActive = isStepActive(step.href, step.id);
                      const isFirst = idx === 0;
                      const isLast = idx === workflowSteps.length - 1;

                      return (
                        <div key={step.id} className="relative flex items-center group py-1.5 min-h-[38px]">
                          {/* Garis Cabang Alur (Pola ╭──, ├──, ╰──) */}
                          <div className="absolute left-0 top-0 bottom-0 right-0 pointer-events-none">
                            {/* Step 1 (First): Top Arc Curve ╭── */}
                            {isFirst && (
                              <>
                                <div className="absolute left-[8px] top-[calc(50%-8px)] w-[12px] h-[9px] border-t-2 border-l-2 border-slate-300 rounded-tl-md" />
                                <div className="absolute left-[8px] top-1/2 bottom-0 w-[2px] bg-slate-300" />
                              </>
                            )}

                            {/* Steps 2-6 (Middle): T-Junction ├── */}
                            {!isFirst && !isLast && (
                              <>
                                <div className="absolute left-[8px] top-0 bottom-0 w-[2px] bg-slate-300" />
                                <div className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[12px] h-[2px] bg-slate-300" />
                              </>
                            )}

                            {/* Step 7 (Last): Bottom Arc Curve ╰── */}
                            {isLast && (
                              <>
                                <div className="absolute left-[8px] top-0 h-1/2 w-[2px] bg-slate-300" />
                                <div className="absolute left-[8px] top-1/2 w-[12px] h-[9px] border-b-2 border-l-2 border-slate-300 rounded-bl-md" />
                              </>
                            )}
                          </div>

                          {/* Lingkaran Angka Netral (1-7) - Presisi di Tengah Horizontal Line */}
                          <div
                            className={`absolute left-[20px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all z-10 ${isActive
                              ? 'bg-[#00a389] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 group-hover:border-slate-400 group-hover:text-slate-800'
                              }`}
                          >
                            {step.stepNum}
                          </div>

                          {/* Button Navigation dengan Icon, Label, dan SLA Badge */}
                          <button
                            onClick={() => navigate(step.href)}
                            className={`w-full flex items-center justify-between gap-2 ml-[48px] px-2.5 py-1.5 rounded-sm text-[12px] transition-all cursor-pointer ${isActive
                              ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                              : 'text-slate-700 font-medium hover:bg-slate-100/90 hover:text-slate-900'
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-900 stroke-[2.2]' : 'text-slate-500'
                                  }`}
                              />
                              <span className="truncate">{step.label}</span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold shrink-0 ${isActive
                                ? 'bg-emerald-100 text-emerald-800 font-bold'
                                : 'bg-slate-100/80 text-slate-500'
                                }`}
                            >
                              {step.sla}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: MEKANISME PERBAIKAN (STANDALONE MENU ITEMS) */}
                <div className="flex flex-col gap-1 relative">
                  <span className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Perbaikan
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {perbaikanItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.href)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[12.5px] transition-all cursor-pointer ${isActive
                            ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                            : 'text-slate-700 font-medium hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900 stroke-[2.2]' : 'text-slate-500'}`} />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          <span className={`w-2 h-2 rounded-full ${item.badgeColor} shrink-0`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4: LAINNYA */}
                <div className="flex flex-col gap-1">
                  <span className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lainnya
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {utilityItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.href)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[12.5px] transition-all cursor-pointer ${isActive
                            ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          title={item.label}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900 stroke-[2.2]' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              /* COLLAPSED MODE NAVIGATION */
              <div className="flex flex-col items-center gap-3 py-1 overflow-visible">

                {/* 1. Beranda */}
                <div
                  className="relative flex justify-center w-full"
                  onMouseEnter={() => setActivePopover('home')}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <button
                    onClick={() => navigate('/dashboard/home')}
                    className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer ${pathname === '/dashboard/home'
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Home className="w-5 h-5" />
                  </button>

                  {activePopover === 'home' && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-4">
                      Beranda
                    </div>
                  )}
                </div>

                <div className="w-6 h-[1px] bg-slate-200/80 my-0.5" />

                {/* 2. Tahapan Pelayanan (Workflow Stepper Popover - Model 3 Minimalist Curved Arc) */}
                <div
                  className="relative flex justify-center w-full"
                  onMouseEnter={() => setActivePopover('workflow')}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <button
                    onClick={() => navigate('/dashboard/workflow/pengajuan')}
                    className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer ${isWorkflowActive
                      ? 'bg-[#00a389] text-white shadow-sm ring-2 ring-[#00a389]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <Workflow className="w-5 h-5" />
                  </button>

                  {/* FLYOUT POPOVER CARD */}
                  {activePopover === 'workflow' && (
                    <div className="absolute left-full top-0 ml-3 w-[270px] bg-white rounded-sm shadow-2xl border border-slate-200/90 p-4 z-50 space-y-2.5 animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-4">
                      <div className="px-2 pb-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        TAHAPAN PELAYANAN
                      </div>

                      {/* TIMELINE STEPPER 1-7 - BRANCH PATTERN */}
                      <div className="relative flex flex-col pt-0.5">
                        {workflowSteps.map((step, idx) => {
                          const Icon = step.icon;
                          const isActive = isStepActive(step.href, step.id);
                          const isFirst = idx === 0;
                          const isLast = idx === workflowSteps.length - 1;

                          return (
                            <div key={step.id} className="relative flex items-center group py-1.5 min-h-[38px]">
                              {/* Garis Cabang Alur (Pola ╭──, ├──, ╰──) */}
                              <div className="absolute left-0 top-0 bottom-0 right-0 pointer-events-none">
                                {/* Step 1 (First): Top Arc Curve ╭── */}
                                {isFirst && (
                                  <>
                                    <div className="absolute left-[8px] top-[calc(50%-8px)] w-[12px] h-[9px] border-t-2 border-l-2 border-slate-300 rounded-tl-md" />
                                    <div className="absolute left-[8px] top-1/2 bottom-0 w-[2px] bg-slate-300" />
                                  </>
                                )}

                                {/* Steps 2-6 (Middle): T-Junction ├── */}
                                {!isFirst && !isLast && (
                                  <>
                                    <div className="absolute left-[8px] top-0 bottom-0 w-[2px] bg-slate-300" />
                                    <div className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[12px] h-[2px] bg-slate-300" />
                                  </>
                                )}

                                {/* Step 7 (Last): Bottom Arc Curve ╰── */}
                                {isLast && (
                                  <>
                                    <div className="absolute left-[8px] top-0 h-1/2 w-[2px] bg-slate-300" />
                                    <div className="absolute left-[8px] top-1/2 w-[12px] h-[9px] border-b-2 border-l-2 border-slate-300 rounded-bl-md" />
                                  </>
                                )}
                              </div>

                              {/* Lingkaran Angka Netral (1-7) - Presisi di Tengah Horizontal Line */}
                              <div
                                className={`absolute left-[20px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all z-10 ${isActive
                                  ? 'bg-[#00a389] text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300 group-hover:border-slate-400 group-hover:text-slate-800'
                                  }`}
                              >
                                {step.stepNum}
                              </div>

                              {/* Button Navigation dengan Icon, Label, dan SLA Badge */}
                              <button
                                onClick={() => navigate(step.href)}
                                className={`w-full flex items-center justify-between gap-2 ml-[48px] px-2.5 py-1.5 rounded-sm text-[12px] transition-all cursor-pointer ${isActive
                                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                                  : 'text-slate-700 font-medium hover:bg-slate-100/90 hover:text-slate-900'
                                  }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon
                                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-900 stroke-[2.2]' : 'text-slate-500'
                                      }`}
                                  />
                                  <span className="truncate">{step.label}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold shrink-0 ${isActive
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-slate-100/80 text-slate-500'
                                    }`}
                                >
                                  {step.sla}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-6 h-[1px] bg-slate-200/80 my-0.5" />

                {/* 3. Standalone Perbaikan Items (NOT a popover branch!) */}
                {perbaikanItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <div
                      key={item.id}
                      className="relative flex justify-center w-full"
                      onMouseEnter={() => setActivePopover(item.id)}
                      onMouseLeave={() => setActivePopover(null)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer ${isActive
                          ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>

                      {activePopover === item.id && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-4">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="w-6 h-[1px] bg-slate-200/80 my-0.5" />

                {/* 4. Utility Items (Kotak Masuk, Lacak, Bantuan) */}
                {utilityItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <div
                      key={item.id}
                      className="relative flex justify-center w-full"
                      onMouseEnter={() => setActivePopover(item.id)}
                      onMouseLeave={() => setActivePopover(null)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all cursor-pointer ${isActive
                          ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>

                      {activePopover === item.id && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-4">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>

          {/* ==================== BOTTOM: Profile Badge ==================== */}
          <div className="mt-auto pt-3 pb-1 border-t border-slate-200/80 flex flex-col justify-center">
            {isSessionLoading ? (
              <div className="flex items-center justify-center py-1.5 select-none">
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
              </div>
            ) : (
              <div
                onClick={() => setIsPersonalProfileDrawerOpen(true)}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-1' : 'gap-2.5 px-2 py-1.5'
                  } rounded-sm cursor-pointer hover:bg-slate-100 transition-colors group`}
                title={userName || 'User Profile'}
              >
                <div className="w-9 h-9 rounded-full bg-[#ffedd5] text-[#9a3412] text-[13px] font-bold flex items-center justify-center shrink-0 border border-[#fed7aa] shadow-2xs group-hover:scale-105 transition-transform">
                  {userInitials.slice(0, 1)}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col truncate max-w-[170px]">
                    <span className="truncate font-medium text-[12.5px] text-slate-800 group-hover:text-slate-900">
                      {userName || 'User Profile'}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">
                      {session?.user?.email || ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}
