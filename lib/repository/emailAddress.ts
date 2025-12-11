import { db } from '@/db';
import { NewEmailAddress } from '../types/mail';
import { emailAddress } from '@/db/schema';

export async function saveEmailAddress(email: NewEmailAddress) {
  try {
    await db.insert(emailAddress).values(email);
  } catch (err) {
    console.error('Error while saving email address, ', err);
  }
}
