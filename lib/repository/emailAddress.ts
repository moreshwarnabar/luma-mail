import { EmailAddress } from '../types/aurinko';

export async function saveEmailAddress(address: EmailAddress) {
  try {
    // TODO: create or update the email address record
  } catch (err) {
    console.error('Error saving email address', err);
  }
}
