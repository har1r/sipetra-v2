import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ApplicationDataTable } from '@/components/shared/tables/ApplicationDataTable';

export const metadata = {
  title: 'Pengajuan Permohonan (Submission) — SIPETRA Architax',
  description: 'Daftar permohonan yang diajukan dan draf pengajuan baru.',
};

export default async function WorkflowSubmissionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const applications = await prisma.application.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      bundle: {
        select: {
          id: true,
          bundleId: true,
          applicationType: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Pengajuan Permohonan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola dan daftarkan permohonan layanan PBB-P2 serta lacak status pemrosesannya.
          </p>
        </div>

        <Link
          href="/dashboard/workflow/submission/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-sm rounded-sm shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Permohonan Baru
        </Link>
      </div>

      <ApplicationDataTable applications={applications} actionRole="FRONT_OFFICER" />
    </div>
  );
}
