import { z } from 'zod';

export const bundleCreateSchema = z.object({
  bundleId: z.string().optional(),
  name: z.string().optional(),
  note: z.string().optional(),
  applicationIds: z.array(z.string()).default([]),
});

export type BundleCreateInput = z.infer<typeof bundleCreateSchema>;

export const assignBundleSchema = z.object({
  applicationId: z.string().min(1, 'ID Permohonan wajib diisi'),
  bundleId: z.string().min(1, 'Bundle wajib dipilih'),
});

export type AssignBundleInput = z.infer<typeof assignBundleSchema>;

export interface BundleSummaryItem {
  id: string;
  bundleId: string;
  name?: string | null;
  note?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById?: string | null;
  createdBy?: {
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: {
    applications: number;
  };
}
