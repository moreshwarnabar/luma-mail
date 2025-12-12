'use client';

import Image from 'next/image';
import { IoPencilOutline } from 'react-icons/io5';
import { MdAlternateEmail } from 'react-icons/md';
import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

const AppSidebarClient = () => {
  const { open } = useSidebar();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={cn('flex justify-between items-center', open && 'pr-3')}
        >
          <div className="flex gap-3 items-center">
            <Image
              src="/luma-mail-logo.svg"
              alt="luma mail logo"
              width={48}
              height={48}
            />
            <h3 className={cn('text-lg font-semibold', !open && 'hidden')}>
              Luma Mail
            </h3>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant="outline"
                  // size="icon-lg"
                  className={cn(
                    'py-5 px-5',
                    'bg-orange-400 hover:bg-orange-300 transition-colors duration-500 ease-out'
                  )}
                  asChild
                >
                  <a href="#" className="flex gap-4">
                    <IoPencilOutline />
                    <span className="font-semibold">Compose</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      {open ? 'Select Account' : <MdAlternateEmail />}
                      <ChevronDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-full"
                    style={
                      triggerWidth ? { width: `${triggerWidth}px` } : undefined
                    }
                  >
                    <DropdownMenuItem>
                      <span>Personal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Arizona State University</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebarClient;
