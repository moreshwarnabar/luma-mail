import Image from 'next/image';
import { IoMenu } from 'react-icons/io5';

import { Button } from '@/components/ui/button';

import { useDashboard } from '@/hooks/use-dashboard';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardHeader = () => {
  const { toggleSidebar } = useDashboard();

  return (
    <div className="flex gap-4 shadow-md">
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
        <div
          className={cn(
            'px-0.5 py-0.5 flex items-center border border-input rounded-full',
            'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]'
          )}
        >
          <Input className="border-0 shadow-none focus-visible:ring-0" />
          <Button variant="outline" size="icon" className="rounded-full">
            <Search />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
