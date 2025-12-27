import { getAurinkoAccessToken, getEmailAccountDetails } from '@/lib/aurinko';
import { auth } from '@/lib/auth';
import { createMailAccount } from '@/lib/repository/mailAccount';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  const accountId = await createMailAccount({
    userId: session.user.id,
    aurinkoId: token.accountId,
    emailAddress: accountInfo.email,
    name: accountInfo.name,
    accessToken: token.accessToken,
  });

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
