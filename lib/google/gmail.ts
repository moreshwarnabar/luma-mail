import { google } from 'googleapis';

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    process.env.GOOGLE_REDIRECT_URI as string
  );
};

export const getAuthUrl = async (state: string) => {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state,
  });
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  id_token?: string | null;
} | null> => {
  const client = getOAuth2Client();
  client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await client.refreshAccessToken();
    return {
      access_token: credentials.access_token as string,
      refresh_token: credentials.refresh_token,
      expiry_date: credentials.expiry_date,
      id_token: credentials.id_token,
    };
  } catch (err) {
    console.error('Failed to refresh access token:', err);
    return null;
  }
};
