import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BundleApprovalView } from '@/components/shared/views/BundleApprovalView';

export const metadata = {
  title: 'Approval & TTD Bundle — SIPETRA Architax',
  description: 'Evaluasi dan tanda tangani berkas permohonan dalam bundle.',
};

export default async function KuptBundleApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const { id } = await params;

  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      applications: {
        select: {
          id: true,
          applicationId: true,
          applicationType: true,
          status: true,
          requestedNop: true,
          smartgovId: true,
          files: true,
          createdAt: true,
          taxSubject: true,
          taxObject: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!bundle) {
    notFound();
  }

  return (
    <div className="w-full">
      <BundleApprovalView bundle={bundle as any} role="HEAD_OF_OFFICE" />
    </div>
  );
}
