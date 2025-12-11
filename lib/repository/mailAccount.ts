import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { mailAccount } from '@/db/schema';

import { NewMailAccount } from '../types/mail';

export async function createMailAccount(account: NewMailAccount) {
  try {
    // check for duplicates
    const isDuplicate =
      (await db.$count(
        mailAccount,
        and(
          eq(mailAccount.provider, account.provider),
          eq(mailAccount.providerAccountId, account.providerAccountId)
        )
      )) == 1;
    if (isDuplicate) {
      return null;
    }

    const insertResponse = await db
      .insert(mailAccount)
      .values({
        userId: account.userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        address: account.address,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken ?? undefined,
        accessTokenExpiresAt: account.accessTokenExpiresAt ?? undefined,
        refreshTokenExpiresAt: account.refreshTokenExpiresAt ?? undefined,
      })
      .returning({ mailAccountId: mailAccount.id });

    const data = insertResponse[0];
    if (!data || !data.mailAccountId) return null;
    return data.mailAccountId;
  } catch (err) {
    console.error('Error inserting mail account into db, ', err);
  }
}
