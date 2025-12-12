import Image from 'next/image';
import Link from 'next/link';
import { IoSearchOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchBar = () => {
  return (
    <div className="border-b-2 flex justify-between items-center px-3 py-1.5 md:py-1">
      <div className="flex gap-4 items-center w-2/5">
        <div>
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <Image
              src="/luma-mail-logo.svg"
              alt="luma-mail-logo"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 640px) 2rem, (max-width: 768px) 2.5rem, 3rem"
              priority
            />
          </div>
        </div>
        <div
          className={cn(
            'border rounded-2xl shadow-sm',
            'flex flex-1 gap-1 items-center px-1',
            'h-8 sm:h-10'
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
