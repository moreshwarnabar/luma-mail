import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { findDefaultMailAccountIdByUserId } from '@/lib/repository/mail-account';

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect('/sign-in');

  const accountId = await findDefaultMailAccountIdByUserId(session.user.id);

  redirect(`/dashboard/${accountId}/inbox?page=1`);
};

export default Dashboard;
