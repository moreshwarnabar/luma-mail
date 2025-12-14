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

export async function findAccountsByUserId(userId: string) {
  try {
    const accounts = await db
      .select()
      .from(mailAccount)
      .where(eq(mailAccount.userId, userId));

    return accounts;
  } catch (err) {
    console.error('Error finding accounts, ', err);
    return [];
  }
}

export async function selectTokensByUserId(userId: string) {
  try {
    const response = await db
      .select({
        accessToken: mailAccount.accessToken,
        refreshToken: mailAccount.refreshToken,
        expiredBy: mailAccount.accessTokenExpiresAt,
      })
      .from(mailAccount)
      .where(eq(mailAccount.userId, userId));

    if (response.length === 0) return null;
    return response[0];
  } catch (err) {
    console.error('Error finding tokens, ', err);
    return null;
  }
}

interface Tokens {
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  token_id?: string | null;
}

export async function saveNewTokensByUserId(userId: string, tokens: Tokens) {
  try {
    await db
      .update(mailAccount)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accessTokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      })
      .where(eq(mailAccount.userId, userId));
  } catch (err) {
    console.error('Error finding tokens, ', err);
    return null;
  }
}
