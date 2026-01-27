import { useParams } from 'next/navigation';
import {
  FaArrowRight,
  FaFirstdraft,
  FaInbox,
  FaTrashAlt,
} from 'react-icons/fa';
import { IoMdCreate } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import { MdLabelImportant } from 'react-icons/md';
import { RiSpam2Fill } from 'react-icons/ri';

import { useDashboard } from '@/hooks/use-dashboard';
import { FolderInfo, MailAccount } from '@/lib/types/entities';

import CollapsedSidebarButton from './collapsed-sidebar-button';
import Image from 'next/image';
import MailAccountAvatar from './mail-account-avatar';

interface CollapsedSidebarProps {
  accounts: MailAccount[];
  folderInfo: FolderInfo;
}

const CollapsedSidebar = ({ accounts, folderInfo }: CollapsedSidebarProps) => {
  const { toggleSidebar } = useDashboard();
  const { accountId, folder } = useParams();

  const selectedAccount = accounts.find(acc => acc.id === accountId);
  if (!selectedAccount) throw new Error('Account ID not present');

  const avatarFallback = selectedAccount.name
    ? selectedAccount.name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0])
        .join('')
    : '@';

  const expandBtnInfo = {
    variant: 'secondary' as const,
    onClick: () => toggleSidebar(),
    icon: <IoMenu className="size-5" />,
    content: 'Expand Sidebar',
    classes: '',
  };
  const composeBtnInfo = {
    variant: 'default' as const,
    onClick: () => console.log('clicked compose'),
    icon: <IoMdCreate className="size-5" />,
    content: 'Compose',
    classes: '',
  };
  const mailAccBtnInfo = {
    variant: 'outline' as const,
    onClick: () => console.log('clicked mail account'),
    icon: <MailAccountAvatar fallback={avatarFallback} />,
    content: selectedAccount.name || selectedAccount.emailAddress,
    classes:
      'p-1 rounded-full bg-accent text-accent-foreground border border-accent-foreground',
  };
  const folderBtns = [
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked inbox'),
      icon: <FaInbox className="size-5" />,
      content:
        folderInfo['inbox']?.unread && folderInfo['inbox']?.unread > 0
          ? `Inbox (${folderInfo['inbox']?.unread})`
          : 'Inbox',
      classes:
        folder === 'inbox'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked important'),
      icon: <MdLabelImportant className="size-5" />,
      content:
        folderInfo['important']?.unread && folderInfo['important']?.unread > 0
          ? `Important (${folderInfo['important']?.unread})`
          : 'Important',
      classes:
        folder === 'important'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked sent'),
      icon: <FaArrowRight className="size-5" />,
      content:
        folderInfo['sent']?.unread && folderInfo['sent']?.unread > 0
          ? `Sent (${folderInfo['sent']?.unread})`
          : 'Sent',
      classes:
        folder === 'sent'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked draft'),
      icon: <FaFirstdraft className="size-5" />,
      content:
        folderInfo['draft']?.total && folderInfo['draft'].total > 0
          ? `Draft (${folderInfo['draft']?.total})`
          : 'Draft',
      classes:
        folder === 'draft'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked junk'),
      icon: <RiSpam2Fill className="size-5" />,
      content:
        folderInfo['junk']?.unread && folderInfo['junk']?.unread > 0
          ? `Junk (${folderInfo['junk']?.unread})`
          : 'Junk',
      classes:
        folder === 'junk'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
    {
      variant: 'ghost' as const,
      onClick: () => console.log('clicked trash'),
      icon: <FaTrashAlt className="size-5" />,
      content:
        folderInfo['trash']?.unread && folderInfo['trash']?.unread > 0
          ? `Trash (${folderInfo['trash']?.unread})`
          : 'Trash',
      classes:
        folder === 'trash'
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : '',
    },
  ];

  return (
    <div className="h-screen bg-sidebar flex flex-col gap-3 items-center py-3 px-1">
      <div>
        <Image src="/luma-mail-logo.svg" alt="logo" width={36} height={36} />
      </div>
      <CollapsedSidebarButton info={expandBtnInfo} />

      <div className="border border-border w-full px-1" />
      <CollapsedSidebarButton info={composeBtnInfo} />
      <CollapsedSidebarButton info={mailAccBtnInfo} />
      <div className="border border-border w-full px-1" />

      {folderBtns.map(btnInfo => (
        <CollapsedSidebarButton key={btnInfo.content} info={btnInfo} />
      ))}
    </div>
  );
};

export default CollapsedSidebar;
