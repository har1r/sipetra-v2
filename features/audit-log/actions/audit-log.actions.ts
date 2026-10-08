'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogFilterInput, auditLogFilterSchema } from '../schemas/audit-log.schema';
import { AuditAction, Prisma } from '@prisma/client';

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

const auditLogInclude = Prisma.validator<Prisma.AuditLogInclude>()({
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
});

export type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: typeof auditLogInclude;
}>;

export async function getAuditLogs(
  filterInput?: Partial<AuditLogFilterInput>
): Promise<ActionResponse<AuditLogWithRelations[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu.',
      };
    }

    const validated = auditLogFilterSchema.safeParse(filterInput || {});
    const filter = validated.success ? validated.data : { page: 1, limit: 50 };
    const page = filter.page || 1;
    const limit = filter.limit || 50;

    const whereClause: Prisma.AuditLogWhereInput = {};

    if (filter.month !== undefined && filter.year !== undefined) {
      whereClause.createdAt = {
        gte: new Date(filter.year, filter.month - 1, 1, 0, 0, 0, 0),
        lte: new Date(filter.year, filter.month, 0, 23, 59, 59, 999),
      };
    }

    if (filter.action && filter.action !== 'ALL') {
      whereClause.action = filter.action as AuditAction;
    }

    if (filter.actorId && filter.actorId !== 'ALL') {
      whereClause.actorId = filter.actorId;
    }

    if (filter.applicationQuery?.trim()) {
      const q = filter.applicationQuery.trim();
      whereClause.application = {
        is: {
          OR: [
            { applicationId: { contains: q, mode: 'insensitive' } },
            { requestedNop: { contains: q, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.findMany({
        where: whereClause,
        include: auditLogInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
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
    if (!session?.user) {
      return { success: false, users: [] };
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { success: false, users: [] };
  }
}
