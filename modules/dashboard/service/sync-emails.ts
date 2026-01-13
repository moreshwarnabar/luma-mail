import pLimit from 'p-limit';
import { EmailMessage } from '@/lib/types/aurinko';
import { saveEmailAddress } from '@/lib/repository/email-address';
import { Thread } from '@/lib/types/entities';
import { saveThread } from '@/lib/repository/thread';
import { saveEmailMessage } from '@/lib/repository/email-message';

export async function syncEmails(
  emails: EmailMessage[],
  mailAccountId: string
) {
  console.log('attempting to sync emails', emails.length);

  try {
    const limit = pLimit(10);
    await Promise.all(
      emails.map(
        async (email, idx) => await upsertEmail(email, idx, mailAccountId)
      )
    );

    console.log('synced all emails');
  } catch (err) {
    console.error('error', err);
  }
}

async function upsertEmail(
  email: EmailMessage,
  idx: number,
  mailAccountId: string
) {
  console.log(`upserting email ${idx + 1}`);

  try {
    // upsert email address
    const addressesFromEmail = [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ];
    const addresses = new Map();
    for (const address of addressesFromEmail)
      addresses.set(address.address, address);

    const savedAddresses = [];
    for (const address of addresses.values()) {
      const resp = await saveEmailAddress(address, mailAccountId);
      if (resp) savedAddresses.push(resp);
    }

    const addressIds = new Map(
      savedAddresses.map(address => [address.address, address.addressId])
    );
    const fromAddress = addressIds.get(email.from.address);
    if (!fromAddress) {
      console.log(`Failed to save email ${email.bodySnippet}`);
      return;
    }

    // upsert thread
    const thread: Thread = {
      id: email.threadId,
      mailAccountId: mailAccountId,
      subject: email.subject,
      lastMessageDate: new Date(email.sentAt),
    };
    await saveThread(thread);

    // upsert email
    await saveEmailMessage(email, fromAddress, addressIds);

    // TODO: upsert email attachments
  } catch (err) {
    console.error('error', err);
  }
}
