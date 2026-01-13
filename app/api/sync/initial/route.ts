import {
  findEmailAccountById,
  updateDeltaTokenById,
} from '@/lib/repository/mail-account';
import { MailAccountWrapper } from '@/lib/wrappers/mail-account-wrapper';
import { syncEmails } from '@/modules/dashboard/service/sync-emails';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId)
    return NextResponse.json(
      { error: 'Missing account id or user id' },
      { status: 400 }
    );

  const mailAccount = await findEmailAccountById(accountId, userId);
  if (!mailAccount)
    return NextResponse.json({ error: 'Account not found' }, { status: 400 });

  const accWrapper = new MailAccountWrapper(mailAccount.accessToken);
  const syncResponse = await accWrapper.performInitialSync();
  if (!syncResponse)
    return NextResponse.json(
      { error: 'Failed to sync account.' },
      { status: 500 }
    );

  const { emails, deltaToken } = syncResponse;
  const mailAccountId = await updateDeltaTokenById(mailAccount.id, deltaToken);

  console.log(emails);

  // TODO: save emails
  await syncEmails(emails, mailAccountId);

  return NextResponse.json({ success: true }, { status: 200 });
}
