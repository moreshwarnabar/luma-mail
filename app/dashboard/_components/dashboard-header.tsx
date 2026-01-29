import Image from 'next/image';
import { IoMenu } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useDashboard } from '@/hooks/use-dashboard';
import EmailSearch from './email-list/email-search';

const DashboardHeader = () => {
  const { toggleSidebar } = useDashboard();

  return (
    <div className="shrink-0 flex gap-4 shadow-md bg-sidebar">
      <div className="px-2 flex gap-2 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="secondary"
              className="hover:cursor-pointer"
              onClick={toggleSidebar}
            >
              <IoMenu className="size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Sidebar</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-3">
          <Image src="/luma-mail-logo.svg" alt="logo" width={48} height={48} />
          <h2 className="text-xl font-semibold">Luma Mail</h2>
        </div>
      </div>
      <div className="ml-auto mr-4 w-1/2 py-1">
        <EmailSearch />
      </div>
    </div>
  );
};

export default DashboardHeader;
