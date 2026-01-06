'use server';

import axios from 'axios';
import { headers } from 'next/headers';

import { auth } from './auth';

export async function getAurinkoAuthUrl(serviceType: 'Google' | 'Office365') {
  const session = await auth.api.getSession({ headers: await headers() });
  // TODO: implement proper error handling
  if (!session) throw new Error();

  const queryParams = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
    responseType: 'code',
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${queryParams.toString()}`;
}

export async function getAurinkoAccessToken(code: string) {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (err) {
    if (axios.isAxiosError(err))
      console.error('Error fetching account details', err.response?.data);
    else console.error('Unexpected error fetching account details', err);
    throw err;
  }
}

export async function getEmailAccountDetails(accessToken: string) {
  try {
    const response = await axios.get('https://api.aurinko.io/v1/account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data as {
      email: string;
      name: string;
    };
  } catch (err) {
    if (axios.isAxiosError(err))
      console.error('Error fetching account details', err.response?.data);
    else console.error('Unexpected error fetching account details', err);
    throw err;
  }
}
