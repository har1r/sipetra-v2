import { z } from 'zod';
import { ApplicationType } from '@prisma/client';

export interface KtuBundleItem {
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
  applications?: Array<{
    id: string;
    applicationId: string;
    status: string;
    smartgovId?: string | null;
    taxSubject?: {
      name?: string;
    };
  }>;
}

export const ktuBundleFilterSchema = z.object({
  searchQuery: z.string().optional(),
  applicationType: z.nativeEnum(ApplicationType).optional(),
});

export type KtuBundleFilterInput = z.infer<typeof ktuBundleFilterSchema>;

export const approveBundleSchema = z.object({
  bundleId: z.string().min(1, 'ID Bundle wajib diisi'),
});

export type ApproveBundleInput = z.infer<typeof approveBundleSchema>;

