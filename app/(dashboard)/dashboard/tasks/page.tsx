import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataEntryWorkspaceTable } from '@/features/data-entry/components/DataEntryWorkspaceTable';

export const metadata = {
  title: 'Workspace Data Entry — SIPETRA Architax',
  description: 'Daftar tugas dan permohonan yang perlu ditindaklanjuti.',
};

export default async function DashboardTasksPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  // Ambil seluruh data permohonan tanpa filter
  const applications = await prisma.application.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Workspace */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Selamat Datang {session.user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola dan daftarkan permohonan pajak daerah serta lacak status pemrosesannya.
          </p>
        </div>

        <Link
          href="/dashboard/applications/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-sm rounded-sm shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Permohonan Baru
        </Link>
      </div>

      {/* Dynamic Table / Cards Workspace */}
      <DataEntryWorkspaceTable applications={applications} />
    </div>
  );
}

