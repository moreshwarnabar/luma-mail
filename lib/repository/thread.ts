import { db } from '@/db';
import {
  FolderCounts,
  SysLabel,
  Thread,
  ThreadListItem,
} from '../types/entities';
import { email, thread } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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
  folder: SysLabel,
  page: number,
  filter?: string
): Promise<ThreadListItem[]> {
  try {
    const applyFilter = folder === 'inbox' && !!filter;
    const filterCondition = applyFilter
      ? sql`AND ${filter} = ANY(e.sys_classifications)`
      : sql``;

    const result = await db.execute(sql`
      SELECT
        t.id,
        t.subject,
        t.last_message_date AS "lastMessageDate",
        e.sys_labels AS "sysLabels",
        e.body_snippet AS "bodySnippet",
        e.has_attachments AS "hasAttachments",
        ea.name AS "fromName",
        ea.address AS "fromAddress"
      FROM thread t
      INNER JOIN email e ON t.id = e.thread_id
      AND t.last_message_date = e.sent_at
      INNER JOIN email_address ea ON e.from = ea.id
      WHERE t.mail_account_id = ${accountId}
        AND ${folder} = ANY(e.sys_labels)
        ${filterCondition}
      ORDER BY "lastMessageDate" DESC
      LIMIT 25 OFFSET ${(page - 1) * 25}
      `);

    return result.rows as unknown as ThreadListItem[];
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

export async function findThreadCountsByFilter(
  accountId: string,
  filter?: string
): Promise<number> {
  try {
    const rows = await db
      .select({
        count: sql<number>`COUNT(DISTINCT CASE 
          WHEN ${filter} = ANY(${email.sysClassifications}) 
          THEN ${email.threadId} 
        END)`,
      })
      .from(email)
      .innerJoin(thread, eq(email.threadId, thread.id))
      .where(eq(thread.mailAccountId, accountId));

    return rows[0]?.count ?? 0;
  } catch (err) {
    console.error('Unable to fetch count of threads by filter', err);
    throw err;
  }
}
