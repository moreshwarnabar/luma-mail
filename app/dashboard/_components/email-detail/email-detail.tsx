import React from 'react';
import { EmailMessage } from '@/lib/types/aurinko';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmailHeader from './email-header';

interface EmailDetailProps {
  emails: EmailMessage[] | undefined;
}

const EmailDetail = ({ emails }: EmailDetailProps) => {
  if (!emails || emails.length === 0) {
    return (
      <div className="h-full bg-card flex items-center justify-center text-muted-foreground">
        Select a thread to view emails
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-card">
      <div className="p-6 space-y-6">
        {emails.map(email => (
          <div key={email.id} className="border-b pb-6 last:border-b-0">
            <EmailHeader email={email} />

            <div className="pt-4">
              {email.body ? (
                <iframe
                  srcDoc={email.body}
                  className="w-full border-0 overflow-hidden"
                  scrolling="no"
                  style={{ minHeight: '200px' }}
                  onLoad={(e) => {
                    const iframe = e.currentTarget;
                    if (iframe.contentDocument) {
                      iframe.style.height = iframe.contentDocument.documentElement.scrollHeight + 'px';
                    }
                  }}
                  sandbox="allow-same-origin"
                />
              ) : (
                <p className="text-muted-foreground">{email.bodySnippet}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EmailDetail;
