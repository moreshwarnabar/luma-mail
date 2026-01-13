import { db } from '@/db';
import { Thread } from '../types/entities';
import { thread } from '@/db/schema';

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
  }
}
