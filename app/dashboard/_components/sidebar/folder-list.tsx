import React from 'react';
import {
  FaArrowRight,
  FaFirstdraft,
  FaInbox,
  FaTrashAlt,
} from 'react-icons/fa';
import { MdLabelImportant } from 'react-icons/md';
import { RiSpam2Fill } from 'react-icons/ri';

import { FolderInfo, SysLabel } from '@/lib/types/entities';
import { useParams } from 'next/navigation';
import FolderItem from './folder-item';

interface FolderListProps {
  folderInfo: FolderInfo;
}

const FolderList = ({ folderInfo }: FolderListProps) => {
  const { folder } = useParams();

  const selectedFolder = folder as SysLabel;

  const order = [
    'inbox',
    'important',
    'sent',
    'draft',
    'junk',
    'trash',
  ] as const;

  const icons: Record<(typeof order)[number], React.ReactNode> = {
    inbox: <FaInbox />,
    important: <MdLabelImportant />,
    sent: <FaArrowRight />,
    draft: <FaFirstdraft />,
    junk: <RiSpam2Fill />,
    trash: <FaTrashAlt />,
  };

  return (
    <div className="mt-1 px-1 flex flex-col gap-2">
      <div>
        <p className="text-xs text-muted-foreground uppercase">folders</p>
      </div>
      <div className="flex flex-col">
        {order.map(label => {
          const info = folderInfo[label];
          if (!info) return null;

          return (
            <FolderItem
              key={info.key}
              name={label}
              icon={icons[label]}
              isSelected={selectedFolder === label}
              total={info.total}
              unread={info.unread}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FolderList;
