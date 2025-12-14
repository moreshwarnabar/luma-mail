import { getOAuth2Client } from '@/lib/google/gmail';
import { gmail_v1, google } from 'googleapis';
import type { Credentials } from 'google-auth-library';

const getGmailClient = (
  access_token: string,
  refresh_token: string | null | undefined
) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token,
    refresh_token,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

export const fetchUserProfile = async (
  tokens: Credentials
): Promise<gmail_v1.Schema$Profile | null> => {
  if (!tokens.access_token) return null;
  const gmail = getGmailClient(tokens.access_token, tokens.refresh_token);

  try {
    const response = await gmail.users.getProfile({ userId: 'me' });
    return response.data;
  } catch (err) {
    console.error('Error fetching gmail profile. ', err);
    // TODO: throw custom exception
    return null;
  }
};

export const fetchLabels = async (
  access_token: string,
  refresh_token: string | null | undefined
): Promise<gmail_v1.Schema$ListLabelsResponse | null> => {
  const gmail = getGmailClient(access_token, refresh_token);

  try {
    const response = await gmail.users.labels.list({ userId: 'me' });
    return response.data;
  } catch (err) {
    console.error('Error while fetching labels, ', err);
    return null;
  }
};
