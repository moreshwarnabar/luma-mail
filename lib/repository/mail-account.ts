import { db } from '@/db';
import { mailAccount } from '@/db/schema';
import { MailAccount, NewMailAccount } from '../types/entities';
import { and, asc, eq } from 'drizzle-orm';

export async function createMailAccount(
  account: NewMailAccount
): Promise<string> {
  try {
    const existing = await db
      .select({ userId: mailAccount.userId })
      .from(mailAccount)
      .where(eq(mailAccount.aurinkoId, account.aurinkoId));

    if (existing[0] && existing[0].userId !== account.userId)
      throw new Error('Another user has already linked this account');

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

export async function findAllMailAccountsByUserId(
  userId: string
): Promise<MailAccount[]> {
  try {
    const response = await db
      .select()
      .from(mailAccount)
      .where(eq(mailAccount.userId, userId));

    return response;
  } catch (err) {
    console.error('Unable to fetch mail accounts for user-id', err);
    throw err;
  }
}

export async function findDefaultMailAccountIdByUserId(
  userId: string
): Promise<string> {
  try {
    const rows = await db
      .select({ accountId: mailAccount.id })
      .from(mailAccount)
      .where(eq(mailAccount.userId, userId))
      .orderBy(asc(mailAccount.linkedAt))
      .limit(1);

    if (!rows[0])
      throw new Error(
        'No accounts linked for current user. Please link an email account.'
      );

    return rows[0].accountId;
  } catch (err) {
    console.error('Unable to fetch the default mail account', err);
    throw err;
  }
}
