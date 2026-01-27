import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboard } from '@/hooks/use-dashboard';
import { MailAccount } from '@/lib/types/entities';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';

const MailAccountDropdown = ({ accounts }: { accounts: MailAccount[] }) => {
  const { accountId } = useParams();
  const { isSidebarCollapsed } = useDashboard();

  const selectedAccount = accounts.find(acc => acc.id === accountId);
  if (!selectedAccount) throw new Error('Account ID not present');

  const fallback = selectedAccount.name
    ? selectedAccount.name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0])
        .join('')
    : '@';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebarCollapsed ? (
          <Button
            variant="outline"
            size="icon"
            className="has-[>svg]:px-1.5 rounded-full hover:cursor-pointer"
          >
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-accent text-accent-foreground">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button variant="outline" className="h-14 has-[>svg]:px-1.5">
            <div className="flex gap-2 items-center max-w-4/5 overflow-clip">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {fallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 items-start text-xs">
                <p className="font-semibold">{selectedAccount.emailAddress}</p>
                <p className="font-extralight text-muted-foreground">
                  {selectedAccount.name}
                </p>
              </div>
            </div>
            <ChevronDown className="ml-auto" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          isSidebarCollapsed ? 'ml-2 w-48' : 'dropdown-content-width-full'
        )}
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
  );
};

export default MailAccountDropdown;
