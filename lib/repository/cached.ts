import { unstable_cache } from 'next/cache';
import { findAccountsByUserId } from './mailAccount';

export const getCachedAccountsByUserId = (userId: string) => {
  return unstable_cache(
    async () => await findAccountsByUserId(userId),
    [userId],
    {
      tags: [`mail-accounts:${userId}`],
    }
  );
};
