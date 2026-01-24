'use-client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MailAccount } from '@/lib/types/entities';

interface AccountSelectorProps {
  accounts: MailAccount[];
}

const AccountSelector = ({ accounts }: AccountSelectorProps) => {
  const { accountId, folder } = useParams();

  const selectedAccount = accounts.find(acc => acc.id === accountId);
  if (!selectedAccount) throw new Error('Account ID not present');

  return (
    <div className="mt-2 px-1 flex flex-col gap-2">
      <div>
        <p className="text-xs text-muted-foreground uppercase">account</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-14 flex justify-around">
            <div className="p-1 rounded-full bg-accent">
              {selectedAccount.name
                ? selectedAccount.name
                    .split(' ')
                    .filter(Boolean)
                    .map(word => word[0])
                    .join('')
                : ''}
            </div>
            <div className="flex flex-col gap-1 items-start text-xs">
              <p className="font-semibold">{selectedAccount.emailAddress}</p>
              <p className="font-extralight text-muted-foreground">
                {selectedAccount.name}
              </p>
            </div>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="dropdown-content-width-full"
        >
          {accounts.map(acc => (
            <DropdownMenuItem
              key={acc.id}
              className={acc.id === accountId ? 'bg-primary' : undefined}
            >
              {acc.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1">
          <MdAdd color="green" />
          Add
        </Button>
        <Button variant="secondary" className="flex-1 text-destructive">
          <MdDelete />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default AccountSelector;
