import { ThreadListItem } from '@/lib/types/entities';
import EmailListItem from './email-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import FilterButton from './filter-button';

interface EmailListProps {
  threads: ThreadListItem[];
}

const EmailList = ({ threads }: EmailListProps) => {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

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

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 flex gap-2 bg-secondary">
        {filterBtns.map(filterInfo => (
          <FilterButton key={filterInfo.name} {...filterInfo} />
        ))}
      </div>
      <ScrollArea className="flex-1 min-h-0 h-full bg-card">
        {threads.map(t => (
          <EmailListItem key={t.id} thread={t} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default EmailList;
