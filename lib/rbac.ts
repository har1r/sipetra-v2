import { UserRole } from '@prisma/client';

export type StageKey =
  | 'submission'
  | 'verification'
  | 'paraf-ktu'
  | 'ttd-kupt'
  | 'pengiriman'
  | 'kantor-pusat'
  | 'selesai';

export interface StageConfig {
  key: StageKey;
  stepNumber: number;
  label: string;
  description: string;
  href: string;
  allowedRoles: string[];
}

export const STAGE_CONFIGS: Record<StageKey, StageConfig> = {
  submission: {
    key: 'submission',
    stepNumber: 1,
    label: 'Pengajuan Permohonan',
    description: 'Pendaftaran berkas baru dan pengelolaan draf permohonan layanan PBB-P2.',
    href: '/dashboard/workflow/submission',
    allowedRoles: ['FRONT_OFFICER'],
  },
  verification: {
    key: 'verification',
    stepNumber: 2,
    label: 'Verifikasi Permohonan',
    description: 'Pemeriksaan validasi berkas fisik & digital serta penyusunan bundle telaah.',
    href: '/dashboard/workflow/verification',
    allowedRoles: ['VERIFICATOR'],
  },
  'paraf-ktu': {
    key: 'paraf-ktu',
    stepNumber: 3,
    label: 'Paraf Kasubag TU',
    description: 'Peninjauan kelayakan administratif dan pemberian paraf pada bundle permohonan.',
    href: '/dashboard/workflow/paraf-ktu',
    allowedRoles: ['HEAD_OF_ADMINISTRATIVE_OFFICE'],
  },
  'ttd-kupt': {
    key: 'ttd-kupt',
    stepNumber: 4,
    label: 'Tanda Tangan KUPT / Kabid',
    description: 'Persetujuan akhir dan penandatanganan berkas permohonan pajak daerah.',
    href: '/dashboard/workflow/ttd-kupt',
    allowedRoles: ['HEAD_OF_OFFICE'],
  },
  pengiriman: {
    key: 'pengiriman',
    stepNumber: 5,
    label: 'Pengiriman Berkas',
    description: 'Pencatatan dan ekspedisi pengiriman berkas ke kantor pusat atau instansi terkait.',
    href: '/dashboard/workflow/pengiriman',
    allowedRoles: ['DELIVERY_OFFICER'],
  },
  'kantor-pusat': {
    key: 'kantor-pusat',
    stepNumber: 6,
    label: 'Proses Kantor Pusat',
    description: 'Pemrosesan basis data terpusat dan sinkronisasi sistem Smartgov / SISMIOP.',
    href: '/dashboard/workflow/kantor-pusat',
    allowedRoles: ['CENTRAL_OFFICER'],
  },
  selesai: {
    key: 'selesai',
    stepNumber: 7,
    label: 'Permohonan Selesai',
    description: 'Arsip berkas tuntas dan pemantauan permohonan yang telah selesai diproses.',
    href: '/dashboard/workflow/selesai',
    allowedRoles: [
      'FRONT_OFFICER',
      'VERIFICATOR',
      'HEAD_OF_ADMINISTRATIVE_OFFICE',
      'HEAD_OF_OFFICE',
      'DELIVERY_OFFICER',
      'CENTRAL_OFFICER',
    ],
  },
};

export const ROLE_LABELS: Record<string, string> = {
  FRONT_OFFICER: 'Front Officer (Penerimaan Berkas)',
  VERIFICATOR: 'Verifikator (Penelaah Berkas)',
  HEAD_OF_ADMINISTRATIVE_OFFICE: 'Kasubag TU / KTU (Paraf)',
  HEAD_OF_OFFICE: 'Kepala Kantor / KUPT (TTD)',
  DELIVERY_OFFICER: 'Petugas Pengiriman',
  CENTRAL_OFFICER: 'Petugas Kantor Pusat',
};

export const ROLE_DEFAULT_ROUTES: Record<string, { href: string; label: string }> = {
  FRONT_OFFICER: { href: '/dashboard/workflow/submission', label: 'Pengajuan' },
  VERIFICATOR: { href: '/dashboard/workflow/verification', label: 'Verifikasi' },
  HEAD_OF_ADMINISTRATIVE_OFFICE: { href: '/dashboard/workflow/paraf-ktu', label: 'Paraf KTU' },
  HEAD_OF_OFFICE: { href: '/dashboard/workflow/ttd-kupt', label: 'TTD KUPT' },
  DELIVERY_OFFICER: { href: '/dashboard/workflow/pengiriman', label: 'Pengiriman' },
  CENTRAL_OFFICER: { href: '/dashboard/workflow/kantor-pusat', label: 'Kantor Pusat' },
};

/**
 * Check if a given user role has permission to access a workflow stage
 */
export function hasStageAccess(userRole: string | undefined | null, stageKey: StageKey): boolean {
  if (!userRole) return false;
  const config = STAGE_CONFIGS[stageKey];
  if (!config) return false;
  return config.allowedRoles.includes(userRole);
}

/**
 * Get human-readable role name
 */
export function formatRoleLabel(role: string | undefined | null): string {
  if (!role) return 'Tidak Diketahui';
  return ROLE_LABELS[role] || role;
}

/**
 * Get default destination route based on user role
 */
export function getDefaultStageForRole(role: string | undefined | null): { href: string; label: string } {
  if (!role || !ROLE_DEFAULT_ROUTES[role]) {
    return { href: '/dashboard/home', label: 'Beranda' };
  }
  return ROLE_DEFAULT_ROUTES[role];
}
