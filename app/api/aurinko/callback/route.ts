import { waitUntil } from '@vercel/functions';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import { createMailAccount } from '@/lib/repository/mail-account';
import { getAurinkoAccessToken, getEmailAccountDetails } from '@/lib/aurinko';
import { performInitialSync } from '@/modules/dashboard/service/initial-sync';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const code = params.get('code');
  if (!code)
    return NextResponse.json({ message: 'No code received.' }, { status: 400 });

  console.log('EXCHANGING CODE FOR TOKEN');
  const token = await getAurinkoAccessToken(code);
  if (!token)
    return NextResponse.json(
      { message: 'Failed to exchange code for access token' },
      { status: 400 }
    );

  const accountInfo = await getEmailAccountDetails(token.accessToken);
  let accountId: string;
  try {
    accountId = await createMailAccount({
      userId: session.user.id,
      aurinkoId: token.accountId,
      emailAddress: accountInfo.email,
      name: accountInfo.name,
      accessToken: token.accessToken,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === 'Another user has already linked this account'
    )
      return NextResponse.json(
        { message: 'Another user has already linked this account' },
        { status: 409 }
      );
    throw err;
  }

  waitUntil(
    performInitialSync(accountId, session.user.id)
      .then(() => {
        console.log('Triggered initial sync');
      })
      .catch(err => {
        console.error('Failed to trigger the initial sync', err);
      })
  );

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
