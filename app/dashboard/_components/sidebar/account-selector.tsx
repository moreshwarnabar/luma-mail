'use-client';

import { MdAdd, MdDelete } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import { MailAccount } from '@/lib/types/entities';

import MailAccountDropdown from './mail-account-dropdown';

interface AccountSelectorProps {
  accounts: MailAccount[];
}

const AccountSelector = ({ accounts }: AccountSelectorProps) => {
  return (
    <div className="mt-2 px-1 flex flex-col gap-2">
      <div>
        <p className="text-xs text-muted-foreground uppercase">account</p>
      </div>
      <MailAccountDropdown accounts={accounts} />
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 hover:cursor-pointer">
          <MdAdd color="green" />
          Add
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-destructive cursor-pointer"
        >
          <MdDelete />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default AccountSelector;
