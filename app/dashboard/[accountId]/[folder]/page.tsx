import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import DashboardShell from '../../_components/dashboard-shell';
import { findAllMailAccountsByUserId } from '@/lib/repository/mail-account';
import { findAllThreadsByMailAccountIdAndSysClassifications } from '@/lib/repository/thread';

interface DashboardProps {
  params: Promise<{ accountId: string; folder: string }>;
  searchParams: Promise<{ filter?: string; page?: string }>;
}

const Dashboard = async ({ params, searchParams }: DashboardProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect('/sign-in');

  const { accountId, folder } = await params;
  const { filter, page } = await searchParams;

  const accounts = await findAllMailAccountsByUserId(session.user.id);
  const threads = await findAllThreadsByMailAccountIdAndSysClassifications(
    accountId,
    ['personal', 'updates']
  );

  return <DashboardShell accounts={accounts} threads={threads} />;
};

export default Dashboard;
