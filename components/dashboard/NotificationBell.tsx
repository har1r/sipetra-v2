"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, X, AlertTriangle, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  judul: string;
  pesan: string;
  isRead: boolean;
  createdAt: Date;
}

// Singleton event bus agar NotificationSystem bisa trigger re-fetch
export const notifBus = {
  listeners: [] as Array<() => void>,
  subscribe(fn: () => void) { this.listeners.push(fn); },
  unsubscribe(fn: () => void) { this.listeners = this.listeners.filter(l => l !== fn); },
  emit() { this.listeners.forEach(fn => fn()); }
};

export default function NotificationBell() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load cached notifications from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('architax_recent_notifications');
      if (cached) {
        try {
          setNotifications(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleTogglePanel = () => {
    if (!panelOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setPanelOpen(v => !v);
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_recent_notifications', JSON.stringify(updated));
    }
  };

  const handleMarkAll = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('architax_recent_notifications', JSON.stringify([]));
    }
    setPanelOpen(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading') {
    return (
      <div className="relative shrink-0">
        <button
          disabled
          className="w-10 h-10 rounded-lg text-slate-400 opacity-70 cursor-not-allowed animate-pulse flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className="w-10 h-10 rounded-lg hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center relative"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
      >
        <Bell className="w-5 h-5 text-slate-700 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        )}
      </button>

      {mounted && panelOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999]">
          <div className="fixed inset-0" onClick={() => setPanelOpen(false)} />
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: `${panelPos.top}px`,
              left: `${panelPos.left}px`,
            }}
            className="w-80 bg-white rounded-md shadow-2xl border border-slate-200/90 z-[100000] overflow-hidden"
          >
            {/* Header Panel */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 font-sans">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 font-medium">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRevision =
                    notif.judul?.toLowerCase().includes('revisi') ||
                    notif.pesan?.toLowerCase().includes('revisi') ||
                    notif.pesan?.toLowerCase().includes('dikembalikan');

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors flex items-start justify-between gap-3 group select-none ${isRevision
                        ? 'bg-rose-50/70 border-l-4 border-l-rose-500 hover:bg-rose-50'
                        : 'bg-white hover:bg-slate-50'
                        }`}
                    >
                      <div className={`p-2 rounded-md shrink-0 mt-0.5 ${isRevision
                        ? 'bg-rose-100 text-rose-600 border border-rose-200/80'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                        }`}>
                        {isRevision ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className={`text-xs font-bold truncate ${isRevision ? 'text-rose-950' : 'text-slate-800'}`}>
                          {notif.judul}
                        </span>
                        <p className={`text-[11px] font-medium leading-normal line-clamp-2 ${isRevision ? 'text-rose-900/80' : 'text-slate-600'}`}>
                          {notif.pesan}
                        </p>
                        <span className={`text-[10px] font-semibold mt-1 ${isRevision ? 'text-rose-400' : 'text-slate-400'}`}>
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className={`p-1.5 transition-colors shrink-0 rounded-md cursor-pointer ${isRevision
                          ? 'text-rose-300 hover:text-rose-600 hover:bg-rose-100'
                          : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        title="Tandai sudah dibaca"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes notifBellShake {
          0%, 100% { transform: rotate(0deg); }
          15%, 45%, 75% { transform: rotate(-12deg); }
          30%, 60%, 90% { transform: rotate(12deg); }
        }
      `}</style>
    </div>
  );
}
