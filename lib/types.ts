export interface MailAccount {
  id: string;
  userId: string;
  accessToken: string;
  emailAddress: string;
  name: string;
}

export type NewMailAccount = Omit<MailAccount, 'id'>;
