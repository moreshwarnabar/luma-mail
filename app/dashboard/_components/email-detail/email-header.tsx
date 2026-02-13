import { EmailMessage } from '@/lib/types/aurinko';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatEmailDate } from '@/lib/utils/format-date';

interface EmailHeaderProps {
  email: EmailMessage;
}

function getInitials(name: string, address: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }
  return address[0]?.toUpperCase() ?? '?';
}

function formatRecipients(addresses: { name: string; address: string }[]) {
  return addresses.map(a => a.name || a.address).join(', ');
}

const EmailHeader = ({ email }: EmailHeaderProps) => {
  const senderName = email.from.name || email.from.address;
  const initials = getInitials(email.from.name, email.from.address);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold leading-tight">{email.subject}</h2>
        <time className="text-xs text-muted-foreground whitespace-nowrap pt-1">
          {formatEmailDate(email.sentAt)}
        </time>
      </div>

      <div className="flex items-start gap-3">
        <Avatar size="lg">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold truncate">{senderName}</span>
            {email.from.name && (
              <span className="text-xs text-muted-foreground truncate">
                {'<'}{email.from.address}{'>'}
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <span>To: {formatRecipients(email.to)}</span>
            {email.cc.length > 0 && (
              <span className="ml-3">Cc: {formatRecipients(email.cc)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailHeader;
