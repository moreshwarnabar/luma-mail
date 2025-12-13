import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { MailAccount } from '@/lib/types/mail';

import AppSidebarClient from '../client/app-sidebar-client';
import { getCachedAccountsByUserId } from '@/lib/repository/cached';

const AppSidebarServer = async ({ accountId }: { accountId?: string }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const userId = session.user.id;

  const accounts: MailAccount[] = await getCachedAccountsByUserId(userId)();

  return (
    <AppSidebarClient
      accounts={accounts}
      selectedAccountId={accountId ?? accounts[0]?.id ?? null}
      showModal={accounts.length === 0}
    />
  );
};

export default AppSidebarServer;
