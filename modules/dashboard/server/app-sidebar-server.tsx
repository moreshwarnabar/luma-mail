import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { MailAccount } from '@/lib/types/mail';
import { findAccountsByUserId } from '@/lib/repository/mailAccount';

import AppSidebarClient from '../client/app-sidebar-client';

const AppSidebarServer = async ({ accountId }: { accountId?: string }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const accounts: MailAccount[] = await findAccountsByUserId(session.user.id);

  return (
    <AppSidebarClient
      accounts={accounts}
      selectedAccountId={accountId ?? accounts[0]?.id ?? null}
      showModal={accounts.length === 0}
    />
  );
};

export default AppSidebarServer;
