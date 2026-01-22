import { auth } from '@/lib/auth/auth';
import { findAllMailAccountsByUserId } from '@/lib/repository/mail-account';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');

  const accounts = await findAllMailAccountsByUserId(session.user.id);
  if (!accounts[0]) redirect('/dashboard');

  const dashboardUrl = `/dashboard/${accounts[0].id}/inbox?page=1`;
  redirect(dashboardUrl);
}
