export interface MailAccount {
  id: string;
  userId: string;
  aurinkoId: number;
  accessToken: string;
  emailAddress: string;
  name: string | null;
}

export type NewMailAccount = Omit<MailAccount, 'id'>;
