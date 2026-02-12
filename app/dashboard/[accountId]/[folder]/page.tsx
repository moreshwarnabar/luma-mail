import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import DashboardShell from '../../_components/dashboard-shell';
import { findAllMailAccountsByUserId } from '@/lib/repository/mail-account';
import {
  findAllThreadsByMailAccountIdAndFolder,
  findThreadCountsByFilter,
  findThreadCountsByFolder,
} from '@/lib/repository/thread';
import { sysLabelEnum } from '@/db/schema';
import { FolderInfo, SysLabel } from '@/lib/types/entities';
import { findEmailsByThreadId } from '@/lib/repository/email-message';

interface DashboardProps {
  params: Promise<{ accountId: string; folder: string }>;
  searchParams: Promise<{ filter?: string; page?: string; threadId: string }>;
}

const Dashboard = async ({ params, searchParams }: DashboardProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect('/sign-in');

  const isSysLabel = (x: string): x is SysLabel => {
    return (sysLabelEnum.enumValues as readonly string[]).includes(x);
  };

  const { accountId, folder } = await params;
  const { filter, threadId } = await searchParams;
  let { page } = await searchParams;
  if (!page || isNaN(Number(page))) page = '1';

  if (!isSysLabel(folder)) throw new Error('Folder not found');

  const [accounts, threads, folderCounts] = await Promise.all([
    findAllMailAccountsByUserId(session.user.id),
    findAllThreadsByMailAccountIdAndFolder(
      accountId,
      folder,
      Number(page),
      filter
    ),
    findThreadCountsByFolder(accountId),
  ]);

  let filterCount;
  if (filter) filterCount = await findThreadCountsByFilter(accountId, filter);

  let emails;
  if (threadId) emails = await findEmailsByThreadId(threadId);

  const folderInfo: FolderInfo = {};

  sysLabelEnum.enumValues.forEach((label, idx) => {
    const totalKey = `${label}Total` as keyof typeof folderCounts;
    const unreadKey = `${label}Unread` as keyof typeof folderCounts;
    // Only include this label if it appears in folderCounts
    if (
      Object.prototype.hasOwnProperty.call(folderCounts, totalKey) ||
      Object.prototype.hasOwnProperty.call(folderCounts, unreadKey)
    ) {
      folderInfo[label] = {
        key: idx,
        total: folderCounts[totalKey] ?? 0,
        unread: folderCounts[unreadKey] ?? 0,
      };
    }
  });

  return (
    <DashboardShell
      accounts={accounts}
      threads={threads}
      folderInfo={folderInfo}
      count={filterCount || folderInfo[folder]?.total}
      emails={emails}
    />
  );
};

export default Dashboard;
