'use client';

import Link from 'next/link';
import { IoSearchOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const SearchBar = () => {
  const { open } = useSidebar();

  return (
    <div className="border-b-2 h-14 flex gap-3 justify-between items-center px-3 py-1.5 md:py-1">
      <div className="flex flex-1 gap-4 items-center">
        <SidebarTrigger />
        <div
          className={cn(
            'border rounded-2xl shadow-sm',
            'flex flex-1 gap-1 items-center px-0.5 md:px-1',
            'lg:max-w-1/2 h-8 sm:h-10',
            !open && 'md:max-w-3/5'
          )}
        >
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Search"
            className={cn(
              'border-0 shadow-none focus-visible:ring-0 focus-visible:border-0',
              'text-xs',
              'h-6 sm:h-8'
            )}
          />
          <Button
            variant="outline"
            size="icon-sm"
            className={cn('rounded-full', 'w-7 h-7', 'sm:w-8 sm:h-8')}
          >
            <IoSearchOutline />
          </Button>
        </div>
      </div>
      <Link href="/profile">
        <Button variant="outline" size="icon-sm" className="rounded-full">
          <FaUser />
        </Button>
      </Link>
    </div>
  );
};

export default SearchBar;
