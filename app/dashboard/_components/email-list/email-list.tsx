import { ThreadListItem } from '@/lib/types/entities';
import EmailListItem from './email-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname, useSearchParams } from 'next/navigation';
import FilterButton from './filter-button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface EmailListProps {
  threads: ThreadListItem[];
  count: number | undefined;
}

const EmailList = ({ threads, count }: EmailListProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = searchParams.get('filter');
  let page = searchParams.get('page');
  if (!page) page = '1';

  const pageNum = Number(page);
  const totalPages = Math.ceil((count ?? 0) / 25);
  const hasPrev = pageNum > 1;
  const hasNext = pageNum < totalPages;

  const filterBtns = [
    {
      name: 'personal',
      isSelected: filter === 'personal',
    },
    {
      name: 'social',
      isSelected: filter === 'social',
    },
    {
      name: 'promotions',
      isSelected: filter === 'promotions',
    },
    {
      name: 'all',
      isSelected: !filter || filter === 'all',
    },
  ];

  const buildPageUrl = (newPage: number) => {
    const urlParams = new URLSearchParams(searchParams);
    urlParams.set('page', String(newPage));
    return `${pathname}?${urlParams.toString()}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 flex gap-2 bg-card">
        {filterBtns.map(filterInfo => (
          <FilterButton key={filterInfo.name} {...filterInfo} />
        ))}
      </div>
      <ScrollArea className="flex-1 min-h-0 h-full bg-card">
        {threads.map(t => (
          <EmailListItem key={t.id} thread={t} />
        ))}
      </ScrollArea>
      <div className="py-3 bg-card flex flex-col justify-center items-center">
        <span className="text-sm">{`${(pageNum - 1) * 25 + 1} — ${Math.min(
          pageNum * 25,
          count ?? 0
        )} of ${count}`}</span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={hasPrev ? buildPageUrl(pageNum - 1) : '#'}
                aria-disabled={!hasPrev}
                className={!hasPrev ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={hasNext ? buildPageUrl(pageNum + 1) : '#'}
                aria-disabled={!hasNext}
                className={!hasNext ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default EmailList;
