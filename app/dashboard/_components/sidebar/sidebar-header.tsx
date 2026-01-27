import Image from 'next/image';
import { IoMenu } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/use-dashboard';

const SidebarHeader = () => {
  const { toggleSidebar } = useDashboard();

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Image src="/luma-mail-logo.svg" alt="logo" width={48} height={48} />
        <h2 className="text-xl font-semibold">Luma Mail</h2>
      </div>
      <div>
        <Button
          size="icon-lg"
          variant="secondary"
          className="hover:cursor-pointer"
          onClick={toggleSidebar}
        >
          <IoMenu />
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
