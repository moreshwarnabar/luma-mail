import { NextRequest, NextResponse } from 'next/server';

import { getOAuth2Client } from '@/lib/google/gmail';
import {
  fetchLabels,
  fetchUserProfile,
} from '@/modules/email/services/gmailService';
import { getActiveUserId } from '@/lib/auth/auth';
import { NewEmailAddress, NewLabel, NewMailAccount } from '@/lib/types/mail';
import { createMailAccount } from '@/lib/repository/mailAccount';
import { saveEmailAddress } from '@/lib/repository/emailAddress';
import { cookies } from 'next/headers';
import { saveLabels } from '@/lib/repository/labels';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const storedState = cookieStore.get('gmail_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    const resp = NextResponse.redirect(
      new URL('/sign-in?error=oauth_state', request.url)
    );
    resp.cookies.delete('gmail_oauth_state');
    return resp;
  }
  cookieStore.delete?.('gmail_oauth_state');

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
    if (!mailAccountId) return null;
    // Create email address entity
    const emailAddress: NewEmailAddress = {
      address: profile.emailAddress,
      accountId: mailAccountId,
    };
    await saveEmailAddress(emailAddress);

    // fetch and save labels
    const response = await fetchLabels(tokens.access_token);
    // Convert the fetched labels into new labels
    const fetchedLabels = response?.labels ?? [];
    const labels: NewLabel[] = fetchedLabels.map(label => ({
      accountId: mailAccountId,
      provider: 'gmail',
      providerId: label.id || '',
      type: label.type === 'system' ? 'system' : 'user',
      messageListVisibility: label.messageListVisibility || '',
      labelListVisibility: label.labelListVisibility || '',
    }));
    await saveLabels(labels);

    revalidateTag(`mail-accounts:${userId}`, 'max');
    revalidatePath('/dashboard');

    const resp = NextResponse.redirect(
      new URL('/dashboard?connected=gmail', request.url)
    );

    return resp;
  } catch (err) {
    console.error('Encountered an error, ', err);
  }
}
