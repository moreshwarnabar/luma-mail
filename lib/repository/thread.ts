import { db } from '@/db';
import { Thread, ThreadListItem } from '../types/entities';
import { email, thread } from '@/db/schema';
import { and, arrayOverlaps, desc, eq } from 'drizzle-orm';

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

export async function findAllThreadsByMailAccountIdAndSysClassifications(
  accountId: string,
  sysClassifications: string[]
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
          arrayOverlaps(email.sysClassifications, sysClassifications)
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
