'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getKuptBundles() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicationId: true,
            status: true,
            smartgovId: true,
            taxSubject: true,
          },
        },
      },
    });

    return { success: true, data: bundles };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat daftar bundle telaah KUPT',
      data: [],
    };
  }
}
