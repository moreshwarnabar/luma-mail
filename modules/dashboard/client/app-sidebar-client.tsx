'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { MailAccount } from '@/lib/types/mail';
import ConnectAccountModal from './connect-account-modal';
import ComposeButton from './components/compose-button';
import AccountsGroup from './components/accounts-group';

interface Props {
  accounts: MailAccount[];
  selectedAccountId: string;
  showModal: boolean;
}

const AppSidebarClient = ({
  accounts,
  selectedAccountId,
  showModal,
}: Props) => {
  const [modalOpen, setModalOpen] = useState(showModal);

  const { open } = useSidebar();

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  const dropdownMenu = accounts.map(acc => (
    <DropdownMenuItem
      key={acc.id}
      className={cn(acc.id === selectedAccountId && 'bg-accent')}
    >
      {acc.name || acc.address}
    </DropdownMenuItem>
  ));

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div
            className={cn('flex justify-between items-center', open && 'pr-3')}
          >
            <div className="flex gap-3 items-center">
              <Image
                src="/luma-mail-logo.svg"
                alt="luma mail logo"
                width={48}
                height={48}
              />
              <h3 className={cn('text-lg font-semibold', !open && 'hidden')}>
                Luma Mail
              </h3>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ComposeButton />
          <AccountsGroup
            sidebarOpen={open}
            selectedAccount={selectedAccount}
            dropdownMenu={dropdownMenu}
          />
        </SidebarContent>
      </Sidebar>
      <ConnectAccountModal isOpen={modalOpen} closeModal={setModalOpen} />
    </>
  );
};

export default AppSidebarClient;
