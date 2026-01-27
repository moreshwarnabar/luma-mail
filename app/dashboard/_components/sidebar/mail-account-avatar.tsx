import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React from 'react';

const MailAccountAvatar = ({ fallback }: { fallback: string }) => {
  return (
    <Avatar>
      <AvatarImage src="" />
      <AvatarFallback className="bg-accent text-accent-foreground">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};

export default MailAccountAvatar;
