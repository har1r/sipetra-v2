import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BundleDataTable } from '@/components/shared/tables/BundleDataTable';

export const metadata = {
  title: 'Paraf KTU (Kepala Tata Usaha) — SIPETRA Architax',
  description: 'Tinjau dan paraf berkas bundle telaah permohonan pajak daerah.',
};

export default async function WorkflowParafKTUPage() {
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
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Paraf Kepala Tata Usaha (KTU)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tinjau kelayakan dan paraf berkas bundle telaah permohonan pajak daerah yang telah dihimpun oleh tim verifikator.
        </p>
      </div>

      <BundleDataTable bundles={bundles as any} />
    </div>
  );
}
