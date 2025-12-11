import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { getAuthUrl } from '@/lib/google/gmail';
import { getActiveUserId } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const userId = await getActiveUserId();
  if (!userId) NextResponse.redirect(new URL('/sign-in', request.url));

  const state = crypto.randomBytes(16).toString('hex');
  const url = await getAuthUrl(state);

  const resp = NextResponse.redirect(url);
  resp.cookies.set('gmail_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: 5 * 60,
  });

  return resp;
}
