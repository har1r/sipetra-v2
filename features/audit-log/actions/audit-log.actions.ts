'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogFilterInput, auditLogFilterSchema, AuditLogItem } from '../schemas/audit-log.schema';
import { AuditAction } from '@prisma/client';

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getAuditLogs(
  filterInput?: Partial<AuditLogFilterInput>
): Promise<ActionResponse<AuditLogItem[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu.',
      };
    }

    const validated = auditLogFilterSchema.safeParse(filterInput || {});
    const filter = validated.success ? validated.data : { limit: 50 };

    const whereClause: any = {};

    if (filter.month !== undefined && filter.year !== undefined) {
      const startDate = new Date(filter.year, filter.month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (filter.action && filter.action !== 'ALL') {
      whereClause.action = filter.action as AuditAction;
    }

    if (filter.actorId && filter.actorId !== 'ALL') {
      whereClause.actorId = filter.actorId;
    }

    if (filter.applicationQuery && filter.applicationQuery.trim()) {
      const q = filter.applicationQuery.trim();
      const matchedApps = await prisma.application.findMany({
        where: {
          OR: [
            { applicationId: { contains: q, mode: 'insensitive' } },
            { requestedNop: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
        take: 100,
      });

      const matchedIds = matchedApps.map((a) => a.id);
      whereClause.applicationId = { in: matchedIds };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        application: {
          select: {
            id: true,
            applicationId: true,
            applicationType: true,
            status: true,
            requestedNop: true,
            taxSubject: true,
            taxObject: true,
          },
        },
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filter.limit || 50,
    });

    return {
      success: true,
      data: logs as unknown as AuditLogItem[],
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return {
      success: false,
      message: 'Gagal mengambil data audit log.',
      data: [],
    };
  }
}

export async function getAuditLogFilterOptions() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, users: [], applications: [] };
    }

    const [users, applications] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.application.findMany({
        select: {
          id: true,
          applicationId: true,
          taxSubject: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
    ]);

    return {
      success: true,
      users,
      applications: applications.map((a) => ({
        id: a.id,
        applicationId: a.applicationId,
        applicantName: a.taxSubject?.name || `Permohonan #${a.applicationId}`,
      })),
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { success: false, users: [], applications: [] };
  }
}
