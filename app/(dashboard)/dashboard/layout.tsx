import DashboardAppShell from '@/components/dashboard/DashboardAppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAppShell>{children}</DashboardAppShell>;
}
