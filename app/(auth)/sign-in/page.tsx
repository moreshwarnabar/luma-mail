import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import SignIn from '@/modules/auth/view/sign-in';
import { redirect } from 'next/navigation';

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) redirect('/dashboard');

  return <SignIn />;
};

export default Page;
