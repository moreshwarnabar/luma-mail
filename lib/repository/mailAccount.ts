import { db } from '@/db';
import { mailAccount } from '@/db/schema';
import { NewMailAccount } from '../types';

export async function createMailAccount(account: NewMailAccount) {
  try {
    const response = await db
      .insert(mailAccount)
      .values({
        userId: account.userId,
        aurinkoId: account.aurinkoId,
        accessToken: account.accessToken,
        emailAddress: account.emailAddress,
        name: account.name,
      })
      .onConflictDoUpdate({
        target: mailAccount.aurinkoId,
        set: { accessToken: account.accessToken },
      })
      .returning({ accountId: mailAccount.id });

    return response[0].accountId;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
