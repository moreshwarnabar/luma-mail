import { ThreadListItem } from '@/lib/types/entities';
import { cn } from '@/lib/utils';
import { formatEmailDate } from '@/lib/utils/format-date';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface EmailListItemProps {
  thread: ThreadListItem;
}

const EmailListItem = ({ thread }: EmailListItemProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getLink = (id: string) => {
    const urlParams = new URLSearchParams(searchParams);
    urlParams.set('threadId', id);

    return `${pathname}?${urlParams.toString()}`;
  };

  return (
    <Link href={getLink(thread.id)}>
      <div className="px-5 py-3 flex flex-col gap-1 hover:bg-muted">
        <div
          className={cn(
            thread.sysLabels.includes('unread')
              ? 'font-normal'
              : 'font-semibold'
          )}
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">{thread.fromName}</h2>
            <span className="text-sm text-muted-foreground">
              {formatEmailDate(thread.lastMessageDate)}
            </span>
          </div>
          <p className="pr-4 font-semibold whitespace-nowrap overflow-hidden">
            {thread.subject}
          </p>
        </div>
        <p className="pr-4 text-sm text-muted-foreground whitespace-nowrap overflow-hidden">
          {thread.bodySnippet}
        </p>
      </div>
      <div className="mx-4 border border-border" />
    </Link>
  );
};

export default EmailListItem;
