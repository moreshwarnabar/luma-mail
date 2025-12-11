import { NextRequest, NextResponse } from 'next/server';

import { getOAuth2Client } from '@/lib/google/gmail';
import { fetchUserProfile } from '@/modules/email/services/gmailService';
import { getActiveUserId } from '@/lib/auth/auth';
import { NewMailAccount } from '@/lib/types/mail';
import { createMailAccount } from '@/lib/repository/mailAccount';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const client = getOAuth2Client();
  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token) return null;
    // Fetch Gmail profile
    const profile = await fetchUserProfile(tokens);
    if (!profile?.emailAddress) return null;
    // Persist account details
    const userId = await getActiveUserId();
    if (!userId) {
      // TODO: throw or return error
      return null;
    }

    const mailAccount: NewMailAccount = {
      userId: userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : undefined,
      refreshTokenExpiresAt: null,
      provider: 'gmail',
      providerAccountId: profile.emailAddress,
      address: profile.emailAddress,
    };
    const mailAccountId = await createMailAccount(mailAccount);
    // TODO: Create email address entity

    const resp = NextResponse.redirect(
      new URL('/dashboard?connected=gmail', request.url)
    );
    if (tokens.access_token)
      resp.cookies.set('gmail-tokens', tokens.access_token);

    return resp;
  } catch (err) {
    console.error('Encountered an error, ', err);
  }
}
