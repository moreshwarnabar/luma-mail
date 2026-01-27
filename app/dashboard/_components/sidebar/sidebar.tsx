'use client';

import SidebarHeader from './sidebar-header';
import ComposeButton from './compose-button';
import AccountSelector from './account-selector';
import { FolderInfo, MailAccount } from '@/lib/types/entities';
import FolderList from './folder-list';

interface SidebarProps {
  accounts: MailAccount[];
  folderInfo: FolderInfo;
}

const Sidebar = ({ accounts, folderInfo }: SidebarProps) => {
  return (
    <div className="h-screen bg-sidebar text-sidebar-foreground px-2 pt-2 flex flex-col gap-3">
      <SidebarHeader />
      <ComposeButton />
      <AccountSelector accounts={accounts} />
      <div className="border-t border-border mx-2 my-1" />
      <FolderList folderInfo={folderInfo} />
    </div>
  );
};

export default Sidebar;
