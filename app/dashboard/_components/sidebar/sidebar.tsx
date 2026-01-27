'use client';

import ComposeButton from './compose-button';
import AccountSelector from './account-selector';
import { FolderInfo, MailAccount } from '@/lib/types/entities';
import FolderList from './folder-list';
import UserProfile from './user-profile';

interface SidebarProps {
  accounts: MailAccount[];
  folderInfo: FolderInfo;
}

const Sidebar = ({ accounts, folderInfo }: SidebarProps) => {
  return (
    <div className="h-screen bg-sidebar text-sidebar-foreground flex flex-col gap-3 px-2 pt-3">
      <ComposeButton />
      <AccountSelector accounts={accounts} />
      <div className="border-t border-border mx-2 my-1" />
      <FolderList folderInfo={folderInfo} />
      <UserProfile />
    </div>
  );
};

export default Sidebar;
