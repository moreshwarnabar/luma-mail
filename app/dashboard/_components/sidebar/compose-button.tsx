import { IoCreate } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import React from 'react';

const ComposeButton = () => {
  return (
    <div className="px-1">
      <Button className="w-full h-12 gap-2 font-semibold text-md bg-sidebar-primary text-sidebar-primary-foreground">
        <IoCreate className="size-6" />
        <span className="">Compose</span>
      </Button>
    </div>
  );
};

export default ComposeButton;
