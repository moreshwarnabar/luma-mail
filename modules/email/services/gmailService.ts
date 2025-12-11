import { getOAuth2Client } from '@/lib/google/gmail';
import { gmail_v1, google } from 'googleapis';
import type { Credentials } from 'google-auth-library';

export const fetchUserProfile = async (
  tokens: Credentials
): Promise<gmail_v1.Schema$Profile | null> => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    const response = await gmail.users.getProfile({ userId: 'me' });
    return response.data;
  } catch (err) {
    console.error('Error fetching gmail profile. ', err);
    // TODO: throw custom exception
    return null;
  }
};
