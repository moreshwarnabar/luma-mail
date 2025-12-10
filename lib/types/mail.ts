export interface MailAccount {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'imap' | 'yahoo';
  providerAccountId: string;
  address: string;
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  lastSyncedAt: Date | null;
}

export type NewMailAccount = Omit<MailAccount, 'id' | 'lastSyncedAt'>;
