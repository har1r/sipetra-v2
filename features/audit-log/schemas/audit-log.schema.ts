import { z } from 'zod';
import { AuditAction, UserRole, ApplicationStatus } from '@prisma/client';

export const AUDIT_ACTION_CONFIG: Record<
  AuditAction,
  { label: string; badge: string; verb: string }
> = {
  SUBMIT: {
    label: 'Submitted',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    verb: 'mendaftarkan permohonan baru',
  },
  CLAIM: {
    label: 'Claimed',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    verb: 'mengklaim verifikasi berkas',
  },
  UNCLAIM: {
    label: 'Unclaimed',
    badge: 'bg-slate-50 text-slate-700 border border-slate-200/80',
    verb: 'membatalkan klaim verifikasi berkas',
  },
  VERIFY_APPROVE: {
    label: 'Verified',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    verb: 'menyetujui verifikasi berkas',
  },
  REQUEST_INTERNAL_REVISION: {
    label: 'Internal Revision',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    verb: 'meminta perbaikan internal',
  },
  REQUEST_EXTERNAL_REVISION: {
    label: 'Declined',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    verb: 'meminta perbaikan wajib pajak',
  },
  RESUBMIT_REVISION: {
    label: 'Resubmitted',
    badge: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    verb: 'mengajukan ulang berkas perbaikan',
  },
  PARAF_ADMINISTRATIVE_HEAD: {
    label: 'Paraf KTU',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    verb: 'memberikan paraf KTU',
  },
  SIGN_OFFICE_HEAD: {
    label: 'Signed',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    verb: 'menandatangani surat keputusan KUPT',
  },
  DISPATCH_DELIVERY: {
    label: 'Dispatched',
    badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
    verb: 'mengirimkan berkas ke loket / ekspedisi',
  },
  PROCESS_CENTRAL: {
    label: 'Central Office',
    badge: 'bg-violet-50 text-violet-700 border border-violet-200/80',
    verb: 'memproses ke kantor pusat',
  },
  COMPLETE: {
    label: 'Completed',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300/80',
    verb: 'menyelesaikan permohonan',
  },
  NOTIFY_WP: {
    label: 'Notified WP',
    badge: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    verb: 'mengirimkan notifikasi ke wajib pajak',
  },
  EXPIRE: {
    label: 'Expired',
    badge: 'bg-rose-100 text-rose-800 border border-rose-200/80',
    verb: 'menandai permohonan kedaluwarsa',
  },
  SLA_RECALCULATED: {
    label: 'SLA Recalculated',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200/80',
    verb: 'menghitung ulang SLA',
  },
  DUPLICATE: {
    label: 'Duplicated',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    verb: 'menduplikasi data permohonan',
  },
  TOGGLE_FAVORITE: {
    label: 'Favorited',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200/80',
    verb: 'memperbarui status favorit',
  },
  EDIT: {
    label: 'Edited',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    verb: 'mengubah data permohonan',
  },
  ASSIGN_BUNDLE: {
    label: 'Bundle Assigned',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    verb: 'memasukkan permohonan ke dalam bundle',
  },
  REMOVE_FROM_BUNDLE: {
    label: 'Bundle Removed',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    verb: 'mengeluarkan permohonan dari bundle',
  },
  CREATE_BUNDLE: {
    label: 'Bundle Created',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    verb: 'membuat bundle berkas baru',
  },
};

export const auditLogFilterSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  applicationQuery: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;

export interface AuditLogItem {
  id: string;
  applicationId: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: UserRole | null;
  action: AuditAction;
  previousStatus?: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  metadata?: any;
  createdAt: string | Date;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  application: {
    id: string;
    applicationId: string;
    applicationType: string;
    status: ApplicationStatus;
    requestedNop?: string | null;
    taxSubject?: {
      name?: string;
      whatsappNumber?: string;
      address?: string;
      [key: string]: any;
    };
    taxObject?: {
      nop?: string;
      address?: string;
      landArea?: number | null;
      buildingArea?: number | null;
      [key: string]: any;
    };
  };
}
