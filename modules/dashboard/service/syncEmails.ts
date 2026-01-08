import pLimit from 'p-limit';
import { EmailMessage } from '@/lib/types/aurinko';
import { saveEmailAddress } from '@/lib/repository/emailAddress';

export async function syncEmails(emails: EmailMessage[]) {
  console.log('attempting to sync emails', emails.length);

  try {
    const limit = pLimit(10);
    await Promise.all(
      emails.map(async (email, idx) => await upsertEmail(email, idx))
    );
  } catch (err) {
    console.error('error', err);
  }
}

async function upsertEmail(email: EmailMessage, idx: number) {
  console.log(`upserting email ${idx + 1}`);

  try {
    // upsert email address
    const addresses = new Map();
    for (const address of [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ])
      addresses.set(address.address, address);
    // TODO: save the returned db records
    for (const address of addresses.values()) await saveEmailAddress(address);
  } catch (err) {
    console.error('error', err);
  }
}
