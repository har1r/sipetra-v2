"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

// ==================== CONTEXT TYPE ====================
interface DashboardContextType {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Profile drawer
  isPersonalProfileDrawerOpen: boolean;
  setIsPersonalProfileDrawerOpen: (open: boolean) => void;

  // Sidebar stats refresh trigger
  sidebarStatsTrigger: number;
  triggerRefreshSidebarStats: () => void;

  // Favorites
  favoritePermohonans: any[];
  refreshFavorites: () => Promise<void>;

  // Global request state (used by feature workspaces)
  globalSelectedRequest: any | null;
  setGlobalSelectedRequest: (request: any | null) => void;

  // Duplicate application flow
  duplicatedApplicationData: any | null;
  setDuplicatedApplicationData: (data: any | null) => void;

  // Universal confirm modal
  showConfirm: (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ==================== PROVIDER ====================
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonalProfileDrawerOpen, setIsPersonalProfileDrawerOpen] = useState(false);
  const [sidebarStatsTrigger, setSidebarStatsTrigger] = useState(0);
  const [favoritePermohonans, setFavoritePermohonans] = useState<any[]>([]);
  const [globalSelectedRequest, setGlobalSelectedRequest] = useState<any | null>(null);
  const [duplicatedApplicationData, setDuplicatedApplicationData] = useState<any | null>(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // ==================== CALLBACKS ====================
  const triggerRefreshSidebarStats = useCallback(() => {
    setSidebarStatsTrigger(prev => prev + 1);
  }, []);

  const refreshFavorites = useCallback(async () => {
    // Will be implemented when favorite feature is rebuilt
    setFavoritePermohonans([]);
  }, []);

  const showConfirm = useCallback(({
    title,
    message,
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  // ==================== CONTEXT VALUE ====================
  const contextValue = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isPersonalProfileDrawerOpen,
    setIsPersonalProfileDrawerOpen,
    sidebarStatsTrigger,
    triggerRefreshSidebarStats,
    favoritePermohonans,
    refreshFavorites,
    globalSelectedRequest,
    setGlobalSelectedRequest,
    duplicatedApplicationData,
    setDuplicatedApplicationData,
    showConfirm,
  }), [
    searchQuery, isMobileMenuOpen, isPersonalProfileDrawerOpen,
    sidebarStatsTrigger, triggerRefreshSidebarStats,
    favoritePermohonans, refreshFavorites,
    globalSelectedRequest, duplicatedApplicationData,
    showConfirm,
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}

      {/* GLOBAL UNIVERSAL CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div
          id="universal-confirm-backdrop"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 flex flex-col gap-4">
            <div className="flex items-start gap-3 select-none">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{confirmModal.title}</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1.5 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 select-none">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
