import React from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

interface CollapsedSidebarButtonProps {
  info: {
    variant: ButtonVariant;
    onClick: () => void;
    icon: React.ReactNode;
    content: string;
    classes: string;
  };
}

const CollapsedSidebarButton = ({ info }: CollapsedSidebarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-lg"
          variant={info.variant}
          className={cn('hover:cursor-pointer', info.classes)}
          onClick={info.onClick}
        >
          {info.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{info.content}</TooltipContent>
    </Tooltip>
  );
};

export default CollapsedSidebarButton;
