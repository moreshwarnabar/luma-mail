export interface MailAccount {
  id: string;
  userId: string;
  aurinkoId: number;
  accessToken: string;
  emailAddress: string;
  name: string | null;
  linkedAt: Date;
}

export type NewMailAccount = Omit<MailAccount, 'id' | 'linkedAt'>;

export interface Thread {
  id: string;
  mailAccountId: string;
  subject: string | null;
  lastMessageDate: Date | null;
}

export type ThreadListItem = Omit<Thread, 'mailAccountId'>;
