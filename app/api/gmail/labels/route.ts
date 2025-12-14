import { getActiveUserId } from '@/lib/auth/auth';
import { refreshAccessToken } from '@/lib/google/gmail';
import {
  saveNewTokensByUserId,
  selectTokensByUserId,
} from '@/lib/repository/mailAccount';
import { fetchLabels } from '@/modules/email/services/gmailService';
import { NextResponse } from 'next/server';

export async function GET() {
  const userId = await getActiveUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: No active user session' },
      { status: 401 }
    );
  }

  let tokens = await selectTokensByUserId(userId);
  console.log('TOKENS:\n', tokens);
  if (!tokens?.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized: No access token found' },
      { status: 401 }
    );
  }

  // Check if the access token is expired
  if (tokens.expiredBy && new Date(tokens.expiredBy) < new Date()) {
    console.log('Access token is expired.');
    // Here you might want to refresh the token, or return an error
    if (!tokens.refreshToken)
      return NextResponse.json(
        { error: 'Access token expired, and no refresh token present.' },
        { status: 401 }
      );
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    if (!newTokens)
      return NextResponse.json(
        { error: 'Unable to refresh tokens.' },
        { status: 401 }
      );
    await saveNewTokensByUserId(userId, newTokens);
    tokens = {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token ?? null,
      expiredBy: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
    };
  }

  const labels = await fetchLabels(tokens.accessToken, tokens.refreshToken);

  if (!labels) {
    return NextResponse.json(
      { error: 'Failed to fetch labels from Gmail API' },
      { status: 500 }
    );
  }

  console.log('LABELS:\n', labels);
  return NextResponse.json(labels);
}
