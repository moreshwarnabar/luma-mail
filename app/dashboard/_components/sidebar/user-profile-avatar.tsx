import { forwardRef } from 'react';
import { BadgeCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import { useDashboard } from '@/hooks/use-dashboard';
import { useSession } from '@/lib/auth/auth-client';

const UserProfileAvatar = forwardRef<HTMLButtonElement>((props, ref) => {
  const { data: session, isPending } = useSession();
  const { isSidebarCollapsed } = useDashboard();

  // TODO: Handle this more gracefully
  if (isPending || !session) return null;
  const { user } = session;

  if (isSidebarCollapsed)
    return (
      <Button ref={ref} {...props} variant="outline" className="mt-auto">
        <Avatar className="overflow-visible mt-auto cursor-pointer">
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.name
              .split(' ')
              .filter(Boolean)
              .map(word => word[0])
              .join('')}
          </AvatarFallback>
          {user.emailVerified && (
            <AvatarBadge className="bg-chart-3">
              <BadgeCheck />
            </AvatarBadge>
          )}
        </Avatar>
      </Button>
    );

  return (
    <Button
      ref={ref}
      {...props}
      variant="outline"
      className="mt-auto h-fit rounded-none justify-normal gap-4 hover:cursor-pointer"
    >
      <div className="relative mt-auto">
        <Avatar className="">
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {user.name
              .split(' ')
              .filter(Boolean)
              .map(word => word[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        {user.emailVerified && (
          <AvatarBadge className="bg-chart-3 absolute -bottom-1 -right-2 z-10">
            <BadgeCheck />
          </AvatarBadge>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </Button>
  );
});

UserProfileAvatar.displayName = 'UserProfileAvatar';

export default UserProfileAvatar;
