"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Share2,
  GraduationCap,
  Gift,
  Globe,
  Star,
  Home,
  CheckSquare,
  Inbox,
  Search,
  HelpCircle,
  Calendar,
  LucideIcon,
  Folder,
  Layers,
  Clock,
  X,
  FileClock,
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { getInitials } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export default function Sidebar() {
  const {
    favoriteApplications,
    setSearchQuery,
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

  const [showCollections, setShowCollections] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

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

  const isResearcherRole = ['RESEARCHER', 'PENELITI'].includes(userRoleRaw);
  const isArchivistRole = ['ARCHIVIST', 'PENGARSIP'].includes(userRoleRaw);
  const isSenderRole = ['SENDER', 'PENGIRIM'].includes(userRoleRaw);

  const mainMenuItems: MenuItem[] = [
    { id: 'home', label: 'Beranda', icon: Home, href: '/dashboard/home' },
    { id: 'tasks', label: 'Tugas Saya', icon: CheckSquare, href: '/dashboard/tasks' },
    {
      id: 'history',
      label: isResearcherRole
        ? 'Riwayat Bundle'
        : isArchivistRole
          ? 'Riwayat Digitalisasi'
          : isSenderRole
            ? 'Riwayat Manifest'
            : 'Riwayat Pengajuan',
      icon: FileClock,
      href: '/dashboard/history',
    },
    { id: 'inbox', label: 'Kotak Masuk', icon: Inbox, href: '/dashboard/inbox' },
    { id: 'tracking', label: 'Lacak Permohonan', icon: Search, href: '/dashboard/tracking' },
    { id: 'help', label: 'Bantuan', icon: HelpCircle, href: '/dashboard/help' },
  ];

  const navigate = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <aside
      id="sidebar-nav"
      style={{
        fontFamily:
          "'Karla', var(--font-karla), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
      className="w-full md:w-[289px] md:max-w-[289px] p-4 h-screen fixed md:sticky top-0 border-r border-gray-300/80 flex flex-col justify-between shrink-0 select-none bg-white text-gray-900 z-30"
    >
      {/* Mobile Close Button */}
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="md:hidden absolute top-2 right-0 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-50"
        title="Tutup Menu"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col justify-between h-full w-full">
        <div className="flex flex-col justify-between h-full">

          {/* TOP: User Header */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between h-[47px] pb-1">
              <div>
                <button
                  type="button"
                  id="workspace-menu"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 group transition-colors text-left"
                >
                  <div className="flex gap-x-2 items-center">
                    {isSessionLoading ? (
                      <>
                        <div className="w-7 h-7 rounded-md bg-slate-200 animate-pulse" />
                        <div className="flex flex-col gap-1 max-w-[130px]">
                          <div className="h-3 w-20 bg-slate-200 rounded-full animate-pulse" />
                          <div className="h-2.5 w-16 bg-slate-200 rounded-full animate-pulse" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-md bg-[#E0E6EB] flex justify-center items-center shrink-0 shadow-sm">
                          <p className="text-center text-[11px] text-[#2D3A46] font-bold uppercase">
                            {userInitials}
                          </p>
                        </div>
                        <div className="flex flex-col max-w-[130px]">
                          <span className="text-slate-900 text-[13px] font-semibold tracking-tight truncate">
                            {firstName ? `Hi, ${firstName}` : 'Hi, User'}
                          </span>
                          <span className="text-slate-500 text-[12px] font-medium leading-tight truncate capitalize">
                            {userRoleFormatted}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-slate-900 transition-colors ml-0.5" />
                </button>
              </div>
              <NotificationBell />
            </div>

            {/* Clock & Date */}
            <div className="flex flex-col gap-2 px-1 py-1">
              <div className="relative flex items-center justify-center rounded-md px-3 py-2 text-[13px] text-white bg-[#00a389] shadow-xs select-none gap-2 font-medium">
                <Clock className="w-4 h-4 shrink-0 text-white stroke-[2.2]" />
                <span className="font-mono text-[13px] font-bold tracking-wider">
                  {currentTime || '00:00:00'}
                </span>
              </div>
              <div className="relative flex items-center justify-center rounded-md px-3 py-1.5 border font-medium text-[13px] border-slate-200 bg-white text-slate-700 shadow-2xs select-none gap-2">
                <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="truncate text-[13px] text-slate-700">{todayFormatted}</span>
              </div>
            </div>
          </div>

          {/* MIDDLE: Scrollable Navigation */}
          <div className="px-1 border-t border-b border-transparent my-3 overflow-y-auto scrollbar-none flex-1">
            <div className="flex flex-col gap-4 my-2">

              {/* Main Nav Items */}
              <nav className="flex flex-col gap-0.5">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.href)}
                      className={`w-full flex group items-center gap-2 px-2.5 py-2 text-left rounded-md text-[13px] transition-all cursor-pointer ${isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-700 font-medium hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      title={item.label}
                    >
                      <div className="w-3.5 h-3.5 shrink-0" />
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-all ${isActive
                          ? 'text-slate-900 fill-slate-900/15 stroke-[2.2]'
                          : 'text-slate-500 fill-none group-hover:text-slate-900 stroke-[1.8]'
                          }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Accordion Favorites */}
              <div className="flex flex-col gap-0.5 pt-1">
                {/* Favorites */}
                <div>
                  <button
                    onClick={() => setShowCollections(!showCollections)}
                    className="w-full flex items-center justify-between group px-2.5 py-2 rounded-md text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-transform duration-200 ${showCollections ? 'rotate-90 text-slate-900' : ''
                            }`}
                        />
                      </div>
                      <Layers
                        className={`w-4 h-4 shrink-0 transition-all ${showCollections ? 'text-slate-900 fill-slate-900/15 stroke-[2.2]' : 'text-slate-500 fill-none group-hover:text-slate-900 stroke-[1.8]'
                          }`}
                      />
                      <span className={showCollections ? 'text-slate-900 font-semibold' : ''}>Favorit</span>
                    </div>
                    {favoriteApplications?.length > 0 && (
                      <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                        {favoriteApplications.length}
                      </span>
                    )}
                  </button>
                  {showCollections && (
                    <div className="pl-12 flex flex-col gap-0.5">
                      {favoriteApplications?.length > 0 ? (
                        <>
                          {(showAllFavorites
                            ? favoriteApplications
                            : favoriteApplications.slice(0, 5)
                          ).map((fav) => {
                            const appNumber =
                              fav.applicationNumber || fav.nomorPelayanan || fav.nomorPermohonan;
                            return (
                              <button
                                key={fav.id}
                                onClick={() => {
                                  setSearchQuery(appNumber);
                                  navigate('/dashboard/tasks');
                                }}
                                className="w-full flex items-center gap-2 text-left py-1.5 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors truncate cursor-pointer"
                                title={`Lihat: ${appNumber}`}
                              >
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                <span className="truncate font-mono text-xs font-bold text-slate-800">
                                  {appNumber}
                                </span>
                              </button>
                            );
                          })}
                          {favoriteApplications.length > 5 && (
                            <button
                              onClick={() => setShowAllFavorites(!showAllFavorites)}
                              className="w-full text-left py-1.5 px-2 text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              {showAllFavorites ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="py-1 px-2 text-[11px] text-slate-500 italic">
                          Belum ada permohonan favorit
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary Links */}
              <div className="flex flex-col gap-0.5 pt-1">
                {[
                  { icon: Share2, label: 'Shared with Me' },
                  { icon: Trash2, label: 'Recently Deleted' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 shrink-0" />
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-900 shrink-0 transition-colors stroke-[1.8]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM: Profile Badge */}
          <div className="mt-auto pt-3 px-1 pb-2 border-t border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              {[
                { icon: GraduationCap, label: 'Learn' },
                { icon: Gift, label: 'Refer & earn' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                >
                  <div className="w-3.5 h-3.5 shrink-0" />
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-900 shrink-0 transition-colors stroke-[1.8]" />
                  <span>{label}</span>
                </button>
              ))}
              <button
                onClick={() => setIsPersonalProfileDrawerOpen(true)}
                className="w-full flex items-center gap-2 group px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
              >
                <div className="w-3.5 h-3.5 shrink-0" />
                <Globe className="w-4 h-4 text-slate-500 group-hover:text-slate-900 shrink-0 transition-colors stroke-[1.8]" />
                <span>Profile</span>
              </button>
            </div>

            {/* User Profile Badge */}
            {isSessionLoading ? (
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md mt-1 select-none">
                <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex flex-col gap-1 max-w-[180px]">
                  <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-2.5 w-32 bg-slate-200 rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsPersonalProfileDrawerOpen(true)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-100 transition-colors group mt-1"
              >
                <div className="w-7 h-7 rounded-full bg-[#ffedd5] text-[#9a3412] text-[13px] font-semibold flex items-center justify-center shrink-0 border border-[#fed7aa]">
                  {userInitials.slice(0, 1)}
                </div>
                <div className="flex flex-col truncate max-w-[180px]">
                  <span className="truncate font-medium text-[13px] text-slate-800 group-hover:text-slate-900">
                    {userName || 'User Profile'}
                  </span>
                  <span className="truncate text-xs font-normal text-slate-500">
                    {session?.user?.email || ''}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}
