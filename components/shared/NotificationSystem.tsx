"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { notifBus } from '@/components/dashboard/NotificationBell';

interface ToastItem {
  id: string;
  judul: string;
  pesan: string;
  createdAt: Date;
}

export default function NotificationSystem() {
  const { status } = useSession();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Auto-dismiss toast terlama setelah 7 detik
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 7000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (status !== 'authenticated' || toasts.length === 0) return null;

  return (
    <>
      {/* Toast Stack */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast, idx) => (
          <div
            key={toast.id}
            className="pointer-events-auto max-w-sm w-full"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="relative bg-white border border-indigo-100 rounded-2xl shadow-2xl overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-2xl" />
              <div className="pl-4 pr-3 py-3 flex items-start gap-3">
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{toast.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{toast.pesan}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatTime(toast.createdAt)}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="h-0.5 bg-indigo-50">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ animation: 'shrinkWidth 7s linear forwards' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}
