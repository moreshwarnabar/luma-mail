'use client';

import SidebarHeader from './sidebar-header';
import ComposeButton from './compose-button';
import AccountSelector from './account-selector';
import { MailAccount } from '@/lib/types/entities';

interface SidebarProps {
  accounts: MailAccount[];
}

const Sidebar = ({ accounts }: SidebarProps) => {
  return (
    <div className="h-screen bg-sidebar text-sidebar-foreground px-2 pt-2 flex flex-col gap-3">
      <SidebarHeader />
      <ComposeButton />
      <AccountSelector accounts={accounts} />
    </div>
  );
};

export default Sidebar;
