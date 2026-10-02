import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BundleForm } from '@/features/verificator/components/BundleForm';

export const metadata = {
  title: 'Buat Bundle Baru — SIPETRA Architax',
  description: 'Kelompokkan berkas permohonan yang diverifikasi ke dalam satu bundle.',
};

export default async function NewBundlePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const pendingApplications = await prisma.application.findMany({
    where: {
      bundleId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      applicationId: true,
      applicationType: true,
      requestedNop: true,
      status: true,
      createdAt: true,
      taxSubject: true,
    },
  });

  return <BundleForm pendingApplications={pendingApplications} />;
}
