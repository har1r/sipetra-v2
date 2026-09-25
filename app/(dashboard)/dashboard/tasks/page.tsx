import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TasksPage from '@/features/tasks/components/TasksPage';

export const metadata = {
  title: 'Tugas Saya — SIPETRA Architax',
  description: 'Daftar tugas dan permohonan yang perlu ditindaklanjuti.',
};

export default async function DashboardTasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login')
  }

  const role = (session.user as any)?.role;
  return <TasksPage />;
}
