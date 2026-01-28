import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

interface FolderItemProps {
  name: string;
  isSelected: boolean;
  icon: React.ReactNode;
  total: number;
  unread?: number;
}

const FolderItem = ({
  name,
  isSelected,
  icon,
  total,
  unread,
}: FolderItemProps) => {
  const { accountId } = useParams();

  return (
    <Link
      href={`/dashboard/${accountId}/${name}?page=1`}
      className={cn(
        'px-4 py-3 flex justify-between rounded-xs hover:cursor-pointer hover:bg-secondary',
        isSelected
          ? 'pl-3 border-l-4 border-l-primary bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent'
          : ''
      )}
    >
      <div className="flex gap-3 items-center">
        {icon}
        <p className="capitalize text-sm font-medium">{name}</p>
      </div>
      <Badge variant={isSelected ? 'default' : 'secondary'}>
        {unread || total}
      </Badge>
    </Link>
  );
};

export default FolderItem;
