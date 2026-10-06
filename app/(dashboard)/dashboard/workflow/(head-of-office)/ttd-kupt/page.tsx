import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { KuptBundleTable } from '@/features/head-of-office/components';

export const metadata = {
  title: 'TTD KUPT (Kepala UPT) — SIPETRA Architax',
  description: 'Tinjau kelayakan dan tanda tangani berkas bundle telaah permohonan pajak daerah.',
};

export default async function WorkflowTtdKUPTPage() {
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
    <div className="w-full space-y-6 pb-16">
      <div className="bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Tanda Tangan Kepala UPT (KUPT)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tinjau kelayakan dan tanda tangani berkas bundle permohonan pajak daerah yang telah diparaf oleh Kepala Tata Usaha (KTU).
        </p>
      </div>

      <KuptBundleTable bundles={bundles as any} />
    </div>
  );
}
