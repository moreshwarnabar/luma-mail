import { db } from '@/db';
import { NewMailAccount } from '../types/mail';
import { mailAccount } from '@/db/schema';

export async function createMailAccount(account: NewMailAccount) {
  try {
    const response = await db
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

    const data = response[0];
    if (!data || !data.mailAccountId) return null;
    return data.mailAccountId;
  } catch (err) {
    console.error('Error inserting mail account into db, ', err);
  }
}
