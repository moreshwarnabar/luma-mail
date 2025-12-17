import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { MailAccount } from '@/lib/types/mail';

import AppSidebarClient from '../client/app-sidebar-client';
import { getCachedAccountsByUserId } from '@/lib/repository/cached';

const AppSidebarServer = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const userId = session.user.id;

  const accounts: MailAccount[] = await getCachedAccountsByUserId(userId)();

  const accountId = accounts[0]?.id ?? null;
  console.log(accountId);

  return (
    <AppSidebarClient
      accounts={accounts}
      selectedAccountId={accountId}
      showModal={accounts.length === 0}
    />
  );
};

export default AppSidebarServer;
