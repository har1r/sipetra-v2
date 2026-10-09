import { z } from 'zod';
import { ApplicationType } from '@prisma/client';

export interface KuptBundleItem {
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

export const kuptBundleFilterSchema = z.object({
  searchQuery: z.string().optional(),
  applicationType: z.nativeEnum(ApplicationType).optional(),
});

export type KuptBundleFilterInput = z.infer<typeof kuptBundleFilterSchema>;

export const signBundleSchema = z.object({
  bundleId: z.string().min(1, 'ID Bundle wajib diisi'),
});

export type SignBundleInput = z.infer<typeof signBundleSchema>;

