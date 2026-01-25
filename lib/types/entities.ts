import { sysLabelEnum } from '@/db/schema';

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

export type SysLabel = (typeof sysLabelEnum.enumValues)[number];

export interface FolderCounts {
  inboxTotal: number;
  inboxUnread: number;
  importantTotal: number;
  importantUnread: number;
  junkTotal: number;
  junkUnread: number;
  trashTotal: number;
  trashUnread: number;
  sentTotal: number;
  sentUnread: number;
  draftTotal: number;
}

export interface Folder {
  key: number;
  total: number;
  unread?: number;
}

export type FolderInfo = Partial<Record<SysLabel, Folder>>;
