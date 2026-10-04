import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BackButton } from '@/components/ui/BackButton';
import { BundleDataTable } from '@/components/shared/tables/BundleDataTable';
import { CreateBundleButton } from '@/features/verificator/components/CreateBundleButton';

export const metadata = {
  title: 'Manajemen Bundle Telaah — SIPETRA Architax',
  description: 'Kelola dan kelompokkan berkas permohonan yang telah diverifikasi ke dalam bundle telaah.',
};

export default async function ManageBundlePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

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
          taxSubject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col items-start justify-between gap-4 pt-1">
        <BackButton />
        <div className="flex items-start justify-between gap-3.5 w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Manajemen Bundle Telaah
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola pengelompokan berkas permohonan ke dalam bundle telaah dan pantau proses verifikasi sebelum diteruskan ke tahapan Paraf KTU.
            </p>
          </div>
          <div className="shrink-0">
            <CreateBundleButton />
          </div>
        </div>
      </div>

      <BundleDataTable bundles={bundles as any} role="VERIFICATOR" />
    </div>
  );
}
