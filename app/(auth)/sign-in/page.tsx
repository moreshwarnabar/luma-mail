import { headers } from 'next/headers';

import { auth } from '@/lib/auth/auth';
import SignIn from './_components/sign-in-form';
import { redirect } from 'next/navigation';

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) redirect('/dashboard');

  return <SignIn />;
};

export default Page;
