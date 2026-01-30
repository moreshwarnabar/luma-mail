import { ThreadListItem } from '@/lib/types/entities';
import EmailListItem from './email-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailListProps {
  threads: ThreadListItem[];
}

const EmailList = ({ threads }: EmailListProps) => {
  return (
    <ScrollArea className="h-full bg-card">
      {threads.map(t => (
        <EmailListItem key={t.id} thread={t} />
      ))}
    </ScrollArea>
  );
};

export default EmailList;
