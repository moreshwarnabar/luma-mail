import { headers } from 'next/headers';

import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import SignUp from './_components/sign-up-form';

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) redirect('/dashboard');

  return <SignUp />;
};

export default Page;
