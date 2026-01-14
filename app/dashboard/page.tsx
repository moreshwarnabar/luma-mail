import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import LinkAccount from './link-account';

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect('/sign-in');

  return <LinkAccount />;
};

export default Dashboard;
