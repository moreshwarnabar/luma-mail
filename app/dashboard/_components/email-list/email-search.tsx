'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EmailSearch = () => {
  return (
    <div
      className={cn(
        'px-0.5 py-0.5 flex items-center border border-input rounded-full',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]'
      )}
    >
      <Input
        name="search"
        placeholder="Search emails..."
        className="border-0 shadow-none focus-visible:ring-0"
      />
      <Button variant="outline" size="icon" className="rounded-full">
        <Search />
      </Button>
    </div>
  );
};

export default EmailSearch;
