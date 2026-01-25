import { db } from '@/db';
import {
  FolderCounts,
  SysLabel,
  Thread,
  ThreadListItem,
} from '../types/entities';
import { email, thread } from '@/db/schema';
import { and, arrayOverlaps, desc, eq, sql } from 'drizzle-orm';

export async function saveThread(newThread: Thread) {
  try {
    const response = await db
      .insert(thread)
      .values(newThread)
      .onConflictDoUpdate({
        target: thread.id,
        set: {
          lastMessageDate: newThread.lastMessageDate,
        },
      })
      .returning({ threadId: thread.id });

    return response[0].threadId;
  } catch (err) {
    console.error('Error while saving thread', err);
    throw err;
  }
}

export async function findAllThreadsByMailAccountIdAndFolder(
  accountId: string,
  folder: SysLabel
): Promise<ThreadListItem[]> {
  try {
    const rows = await db
      .selectDistinct({
        id: thread.id,
        subject: thread.subject,
        lastMessageDate: thread.lastMessageDate,
      })
      .from(thread)
      .innerJoin(email, eq(thread.id, email.threadId))
      .where(
        and(
          eq(thread.mailAccountId, accountId),
          arrayOverlaps(email.sysLabels, [folder])
        )
      )
      .groupBy(thread.id)
      .orderBy(desc(thread.lastMessageDate));

    return rows;
  } catch (err) {
    console.error('Unable to fetch threads.', err);
    throw err;
  }
}

export async function findThreadCountsByFolder(
  accountId: string
): Promise<FolderCounts> {
  try {
    const rows = await db
      .select({
        inboxTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'inbox' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        inboxUnread: sql<number>`COUNT(DISTINCT CASE WHEN 'inbox' = ANY(${email.sysLabels}) AND 'unread' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        importantTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'important' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        importantUnread: sql<number>`COUNT(DISTINCT CASE WHEN 'important' = ANY(${email.sysLabels}) AND 'unread' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        junkTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'junk' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        junkUnread: sql<number>`COUNT(DISTINCT CASE WHEN 'junk' = ANY(${email.sysLabels}) AND 'unread' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        trashTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'trash' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        trashUnread: sql<number>`COUNT(DISTINCT CASE WHEN 'trash' = ANY(${email.sysLabels}) AND 'unread' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        sentTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'sent' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        sentUnread: sql<number>`COUNT(DISTINCT CASE WHEN 'sent' = ANY(${email.sysLabels}) AND 'unread' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
        draftTotal: sql<number>`COUNT(DISTINCT CASE WHEN 'draft' = ANY(${email.sysLabels}) THEN ${email.threadId} END)`,
      })
      .from(email)
      .innerJoin(thread, eq(email.threadId, thread.id))
      .where(eq(thread.mailAccountId, accountId));

    return rows[0];
  } catch (err) {
    console.error('Unable to fetch counts of threads for each folder', err);
    throw err;
  }
}
