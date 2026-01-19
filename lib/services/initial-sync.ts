import {
  findEmailAccountById,
  updateDeltaTokenById,
} from '@/lib/repository/mail-account';
import { AurinkoEmailClient } from '@/lib/clients/aurinko-email-client';
import { syncEmails } from '@/lib/services/sync-emails';

export async function performInitialSync(accountId: string, userId: string) {
  const mailAccount = await findEmailAccountById(accountId, userId);
  if (!mailAccount) throw new Error('Account not found');

  const aurinkoClient = new AurinkoEmailClient(mailAccount.accessToken);
  const syncResponse = await aurinkoClient.performInitialSync();
  if (!syncResponse) throw new Error('Failed to sync account');

  const { emails, deltaToken } = syncResponse;
  const mailAccountId = await updateDeltaTokenById(mailAccount.id, deltaToken);

  await syncEmails(emails, mailAccountId);

  return { success: true };
}
