import { db } from '@/db';
import { mailAccount } from '@/db/schema';
import { MailAccount, NewMailAccount } from '../types/entities';
import { and, eq } from 'drizzle-orm';

export async function createMailAccount(
  account: NewMailAccount
): Promise<string> {
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

export async function findEmailAccountById(
  accountId: string,
  userId: string
): Promise<MailAccount> {
  try {
    const response = await db
      .select()
      .from(mailAccount)
      .where(
        and(eq(mailAccount.id, accountId), eq(mailAccount.userId, userId))
      );

    return response[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateDeltaTokenById(
  accountId: string,
  deltaToken: string
): Promise<string> {
  try {
    const response = await db
      .update(mailAccount)
      .set({ updatedDeltaToken: deltaToken })
      .where(eq(mailAccount.id, accountId))
      .returning({ accountId: mailAccount.id });

    return response[0].accountId;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
