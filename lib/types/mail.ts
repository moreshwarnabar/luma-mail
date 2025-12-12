export interface MailAccount {
  id: string;
  userId: string;
  name: string | null;
  provider: 'gmail' | 'outlook' | 'imap' | 'yahoo';
  providerAccountId: string;
  address: string;
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  lastSyncedAt: Date | null;
}

export type NewMailAccount = Omit<MailAccount, 'id' | 'lastSyncedAt' | 'name'>;

export interface EmailAddress {
  id: string;
  name: string;
  address: string;
  accountId: string;
}

export type NewEmailAddress = Omit<EmailAddress, 'id' | 'name'>;
