import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { headers } from 'next/headers';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
    },
  }),
});

export async function getActiveUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      // TODO: throw exception or return Error
      return null;
    }

    return session.user.id;
  } catch (err) {
    console.error('Error when fetching userId, ', err);
    return null;
  }
}
