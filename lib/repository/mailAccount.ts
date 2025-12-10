import { db } from '@/db';
import { NewMailAccount } from '../types/mail';
import { mailAccount } from '@/db/schema';

export async function createMailAccount(account: NewMailAccount) {
  try {
    return await db
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
  } catch (err) {
    console.error('Error inserting mail account into db, ', err);
  }
}
