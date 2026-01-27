'use client';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDashboard } from '@/hooks/use-dashboard';
import { useSession } from '@/lib/auth/auth-client';
import { BadgeCheck } from 'lucide-react';

const UserProfile = () => {
  const { data: session, isPending } = useSession();
  const { isSidebarCollapsed } = useDashboard();

  // TODO: Handle this more gracefully
  if (isPending || !session) return null;
  const { user } = session;

  if (isSidebarCollapsed)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side="right">Profile</TooltipContent>
      </Tooltip>
    );

  return (
    <Button
      variant="outline"
      className="mt-auto h-fit rounded-none justify-normal gap-4 hover:cursor-pointer"
    >
      <Avatar className="overflow-visible">
        <AvatarImage src={user.image ?? ''} />
        <AvatarFallback className="bg-accent text-accent-foreground">
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
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </Button>
  );
};

export default UserProfile;
