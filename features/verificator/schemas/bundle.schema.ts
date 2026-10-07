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
