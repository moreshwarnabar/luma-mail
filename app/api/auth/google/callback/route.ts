import { NextRequest, NextResponse } from 'next/server';

import { getOAuth2Client } from '@/lib/google/gmail';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);

  // TODO: Fetch Gmail profile

  // TODO: Persist account details

  // TODO: Create email address entity

  const resp = NextResponse.redirect(new URL('/dashboard', request.url));
  if (tokens.access_token)
    resp.cookies.set('gmail-tokens', tokens.access_token);

  return resp;
}
