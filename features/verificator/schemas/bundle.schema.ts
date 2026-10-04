import { z } from 'zod';
import { ApplicationType } from '@prisma/client';

export const bundleCreateSchema = z.object({
  bundleId: z.string().optional(),
  applicationType: z.nativeEnum(ApplicationType, {
    message: 'Jenis permohonan wajib dipilih',
  }),
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
  applicationType?: ApplicationType | null;
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
