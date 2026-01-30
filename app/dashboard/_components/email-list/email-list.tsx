import { ThreadListItem } from '@/lib/types/entities';
import EmailListItem from './email-list-item';

interface EmailListProps {
  threads: ThreadListItem[];
}

const EmailList = ({ threads }: EmailListProps) => {
  return (
    <div className="h-full bg-card overflow-y-scroll">
      {threads.map(t => (
        <EmailListItem key={t.id} thread={t} />
      ))}
    </div>
  );
};

export default EmailList;
