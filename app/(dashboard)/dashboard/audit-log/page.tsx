import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuditLogPage from '@/features/audit-log/components/AuditLogPage';
import { getAuditLogs, getAuditLogFilterOptions } from '@/features/audit-log/actions/audit-log.actions';

export const metadata = {
  title: 'Activity Log — SIPETRA Architax',
  description: 'Catatan aktivitas dan riwayat perubahan permohonan pajak daerah.',
};

export default async function DashboardAuditLogPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const currentDate = new Date();
  const [logsResult, optionsResult] = await Promise.all([
    getAuditLogs({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      limit: 50,
    }),
    getAuditLogFilterOptions(),
  ]);

  return (
    <AuditLogPage
      initialLogs={logsResult.data || []}
      initialUsers={optionsResult.users || []}
      initialApplications={optionsResult.applications || []}
    />
  );
}
