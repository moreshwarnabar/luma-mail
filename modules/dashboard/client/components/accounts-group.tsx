import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { MailAccount } from '@/lib/types/mail';
import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MdAlternateEmail } from 'react-icons/md';

interface Props {
  sidebarOpen: boolean;
  selectedAccount: MailAccount | undefined;
  dropdownMenu: React.ReactNode;
}

const AccountsGroup = ({
  sidebarOpen,
  selectedAccount,
  dropdownMenu,
}: Props) => {
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
    undefined
  );
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [sidebarOpen]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Accounts</SidebarGroupLabel>
      <SidebarGroupAction title="Add Account">
        <Plus /> <span className="sr-only">Add Account</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  ref={triggerRef}
                  variant="outline"
                  className="py-5 px-3 w-full"
                >
                  {sidebarOpen ? (
                    selectedAccount?.name ||
                    selectedAccount?.address ||
                    'Select Account'
                  ) : (
                    <MdAlternateEmail />
                  )}
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-full"
                style={
                  triggerWidth ? { width: `${triggerWidth}px` } : undefined
                }
              >
                {dropdownMenu}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default AccountsGroup;
