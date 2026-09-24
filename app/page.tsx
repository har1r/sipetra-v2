import { redirect } from 'next/navigation';

/**
 * Root page — redirects authenticated users to /dashboard/home.
 * Middleware ensures unauthenticated users never reach here.
 */
export default function RootPage() {
  redirect('/dashboard/home');
}
