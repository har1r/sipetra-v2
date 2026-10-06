'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  X,
  User as UserIcon,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AuditAction } from '@prisma/client';
import { AUDIT_ACTION_CONFIG, AuditLogItem } from '../schemas/audit-log.schema';
import { getAuditLogs, getAuditLogFilterOptions } from '../actions/audit-log.actions';
import { getApplicationStatusInfo } from '@/features/front-officer/schemas/application.schema';
import { getInitials } from '@/lib/utils';

interface AuditLogPageProps {
  initialLogs?: AuditLogItem[];
  initialUsers?: Array<{ id: string; name: string; role: string; email: string }>;
  initialApplications?: Array<{ id: string; applicationId: string; applicantName: string }>;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function AuditLogPage({
  initialLogs = [],
  initialUsers = [],
  initialApplications = [],
}: AuditLogPageProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedActorId, setSelectedActorId] = useState<string>('ALL');
  const [applicationQuery, setApplicationQuery] = useState<string>('');

  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [users, setUsers] = useState(initialUsers);
  const [applications, setApplications] = useState(initialApplications);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load filter options on mount if empty
  useEffect(() => {
    if (initialUsers.length === 0 || initialApplications.length === 0) {
      getAuditLogFilterOptions().then((res) => {
        if (res.success) {
          if (res.users) setUsers(res.users);
          if (res.applications) setApplications(res.applications);
        }
      });
    }
  }, [initialUsers, initialApplications]);

  // Fetch logs whenever filters change
  const fetchFilteredLogs = (
    m = selectedMonth,
    y = selectedYear,
    act = selectedAction,
    actor = selectedActorId,
    appQ = applicationQuery
  ) => {
    startTransition(async () => {
      const res = await getAuditLogs({
        month: m,
        year: y,
        action: act,
        actorId: actor,
        applicationQuery: appQ,
        limit: 50,
      });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    });
  };

  const handlePrevMonth = () => {
    let nextM = selectedMonth - 1;
    let nextY = selectedYear;
    if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    setSelectedMonth(nextM);
    setSelectedYear(nextY);
    fetchFilteredLogs(nextM, nextY, selectedAction, selectedActorId, applicationQuery);
  };

  const handleNextMonth = () => {
    let nextM = selectedMonth + 1;
    let nextY = selectedYear;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setSelectedMonth(nextM);
    setSelectedYear(nextY);
    fetchFilteredLogs(nextM, nextY, selectedAction, selectedActorId, applicationQuery);
  };

  const handleActionChange = (actionVal: string) => {
    setSelectedAction(actionVal);
    fetchFilteredLogs(selectedMonth, selectedYear, actionVal, selectedActorId, applicationQuery);
  };

  const handleActorChange = (actorVal: string) => {
    setSelectedActorId(actorVal);
    fetchFilteredLogs(selectedMonth, selectedYear, selectedAction, actorVal, applicationQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredLogs(selectedMonth, selectedYear, selectedAction, selectedActorId, applicationQuery);
  };

  const handleReset = () => {
    const curMonth = currentDate.getMonth() + 1;
    const curYear = currentDate.getFullYear();
    setSelectedMonth(curMonth);
    setSelectedYear(curYear);
    setSelectedAction('ALL');
    setSelectedActorId('ALL');
    setApplicationQuery('');
    fetchFilteredLogs(curMonth, curYear, 'ALL', 'ALL', '');
  };

  const formatActivityTime = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';

    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('id-ID', { month: 'short' });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} @ ${hours}:${minutes} WIB`;
  };

  const isResetActive =
    selectedAction !== 'ALL' ||
    selectedActorId !== 'ALL' ||
    applicationQuery !== '' ||
    selectedMonth !== currentDate.getMonth() + 1 ||
    selectedYear !== currentDate.getFullYear();

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log</h1>
      </div>

      {/* Filter Controls Bar matching reference design */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Month/Year Picker Control */}
        <div className="inline-flex items-center bg-white border border-slate-300 rounded-md shadow-xs h-9 overflow-hidden">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="h-full px-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer border-r border-slate-200"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-700 select-none">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {MONTH_NAMES[selectedMonth - 1]}, {selectedYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="h-full px-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer border-l border-slate-200"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown 1: Audit Types */}
        <div className="relative">
          <select
            value={selectedAction}
            onChange={(e) => handleActionChange(e.target.value)}
            className="h-9 px-3 pr-8 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-400 focus:outline-hidden focus:border-[#00a389] cursor-pointer appearance-none"
          >
            <option value="ALL">All Audit Types</option>
            {Object.keys(AUDIT_ACTION_CONFIG).map((actionKey) => (
              <option key={actionKey} value={actionKey}>
                {AUDIT_ACTION_CONFIG[actionKey as AuditAction]?.label || actionKey}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Dropdown 2: Employees / Users */}
        <div className="relative">
          <select
            value={selectedActorId}
            onChange={(e) => handleActorChange(e.target.value)}
            className="h-9 px-3 pr-8 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-400 focus:outline-hidden focus:border-[#00a389] cursor-pointer appearance-none max-w-[220px]"
          >
            <option value="ALL">All Employees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Search for Application */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-sm">
          <input
            type="text"
            value={applicationQuery}
            onChange={(e) => setApplicationQuery(e.target.value)}
            placeholder="Cari No. Permohonan / NOP..."
            className="w-full h-9 pl-9 pr-8 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:outline-hidden focus:border-[#00a389] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {applicationQuery && (
            <button
              type="button"
              onClick={() => {
                setApplicationQuery('');
                fetchFilteredLogs(selectedMonth, selectedYear, selectedAction, selectedActorId, '');
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Reset button */}
        {isResetActive && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main List Container */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {isPending ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-5 h-5 border-2 border-[#00a389] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium">Memuat data activity log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Aktivitas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ditemukan catatan log untuk periode atau filter yang dipilih.
            </p>
            {isResetActive && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const actorName = log.actorName || log.actor?.name || 'Petugas Sistem';
              const isUnfavorite = log.action === 'TOGGLE_FAVORITE' && log.metadata?.isFavorite === false;
              const actionCfg = isUnfavorite
                ? {
                  label: 'Unfavorited',
                  badge: 'bg-slate-100 text-slate-600 border border-slate-200/80',
                  verb: 'menghapus permohonan dari favorit',
                }
                : AUDIT_ACTION_CONFIG[log.action] || {
                  label: log.action,
                  badge: 'bg-slate-100 text-slate-700 border border-slate-200',
                  verb: 'memperbarui',
                };

              const appNumber = log.application?.applicationId || '-';
              const applicantName = log.application?.taxSubject?.name || '';
              const targetTitle = applicantName
                ? `Permohonan #${appNumber} (${applicantName})`
                : `Permohonan #${appNumber}`;

              return (
                <div
                  key={log.id}
                  className="py-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar circle */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                      {getInitials(actorName)}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      {/* Line 1: Actor + Badge + Object */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-bold text-slate-900 tracking-tight">{actorName}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${actionCfg.badge}`}
                        >
                          {actionCfg.label}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          Permohonan #{appNumber}
                        </span>
                        {applicantName && (
                          <span className="text-slate-500 font-normal text-xs sm:text-sm">
                            ({applicantName})
                          </span>
                        )}
                      </div>

                      {/* Line 2: Timestamp */}
                      <div className="text-xs text-slate-500 font-normal">
                        {formatActivityTime(log.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Show Details Button */}
                  <div className="shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
                    >
                      Show Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-lg shadow-2xl max-w-lg w-full z-10 overflow-hidden text-left animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Rincian Aktivitas
                </h3>
                <p className="text-xs text-slate-500">
                  ID Log: <span className="font-mono text-slate-600">{selectedLog.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {/* Petugas & Waktu */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-md border border-slate-100">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Petugas (Aktor)
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedLog.actorName || selectedLog.actor?.name || 'Sistem'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedLog.actorRole || selectedLog.actor?.role || '-'}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Waktu Aktivitas
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formatActivityTime(selectedLog.createdAt)}
                  </p>
                </div>
              </div>

              {/* Aksi & Perubahan Status */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Aksi & Perubahan
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Tindakan:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedLog.action === 'TOGGLE_FAVORITE' && selectedLog.metadata?.isFavorite === false
                        ? 'bg-slate-100 text-slate-600 border border-slate-200/80'
                        : AUDIT_ACTION_CONFIG[selectedLog.action]?.badge || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedLog.action === 'TOGGLE_FAVORITE' && selectedLog.metadata?.isFavorite === false
                      ? 'Unfavorited'
                      : AUDIT_ACTION_CONFIG[selectedLog.action]?.label || selectedLog.action}
                  </span>
                </div>

                {selectedLog.previousStatus && selectedLog.previousStatus !== selectedLog.newStatus && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-sm">
                      {getApplicationStatusInfo(selectedLog.previousStatus).label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded-sm">
                      {getApplicationStatusInfo(selectedLog.newStatus).label}
                    </span>
                  </div>
                )}
              </div>

              {/* Data Permohonan Terkait */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Permohonan Terkait
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">No. Permohonan</span>
                    <span className="font-bold text-slate-900">
                      #{selectedLog.application?.applicationId || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Jenis Permohonan</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLog.application?.applicationType || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Wajib Pajak (Pemohon)</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLog.application?.taxSubject?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Nomor WhatsApp</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLog.application?.taxSubject?.whatsappNumber || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata JSON jika ada */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-md border border-slate-100">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Metadata Perubahan
                  </span>
                  <pre className="p-2.5 bg-white border border-slate-200 rounded-sm font-mono text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
