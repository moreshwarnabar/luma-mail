type provider = 'gmail' | 'outlook' | 'imap' | 'yahoo';

export interface MailAccount {
  id: string;
  userId: string;
  name: string | null;
  provider: provider;
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

export interface Label {
  id: string;
  accountId: string;
  provider: provider;
  providerId: string;
  name: string;
  description: string;
  type: 'user' | 'system';
  colorBg: string;
  colorText: string;
  messageListVisibility: string;
  labelListVisibility: string;
}

export type NewLabel = Omit<
  Label,
  'id' | 'name' | 'description' | 'colorBg' | 'colorText'
>;
