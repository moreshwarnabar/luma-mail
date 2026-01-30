import { ThreadListItem } from '@/lib/types/entities';
import { cn } from '@/lib/utils';
import { formatEmailDate } from '@/lib/utils/format-date';

interface EmailListItemProps {
  thread: ThreadListItem;
}

const EmailListItem = ({ thread }: EmailListItemProps) => {
  return (
    <div className="p-3 flex flex-col gap-1 border border-border hover:bg-muted hover:cursor-pointer">
      <div
        className={cn(
          thread.sysLabels.includes('unread') ? 'font-normal' : 'font-semibold'
        )}
      >
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{thread.fromName}</h2>
          <span className="text-sm text-muted-foreground">
            {formatEmailDate(thread.lastMessageDate)}
          </span>
        </div>
        <p className="font-semibold  whitespace-nowrap overflow-clip">
          {thread.subject}
        </p>
      </div>
      <p className="text-sm text-muted-foreground whitespace-nowrap overflow-clip">
        {thread.bodySnippet}
      </p>
    </div>
  );
};

export default EmailListItem;
