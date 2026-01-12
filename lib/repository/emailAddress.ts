import { db } from '@/db';
import { EmailAddress } from '../types/aurinko';
import { emailAddress } from '@/db/schema';

export async function saveEmailAddress(
  address: EmailAddress,
  mailAccountId: string
) {
  try {
    const response = await db
      .insert(emailAddress)
      .values({ ...address, mailAccountId })
      .onConflictDoUpdate({
        target: emailAddress.address,
        set: { name: address.name, raw: address.raw },
      })
      .returning({ addressId: emailAddress.id, address: emailAddress.address });

    return response[0];
  } catch (err) {
    console.error('Error saving email address', err);
  }
}
