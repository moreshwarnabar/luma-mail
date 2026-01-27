'use client';

import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileAvatar from './user-profile-avatar';

import { useDashboard } from '@/hooks/use-dashboard';
import { signOut, useSession } from '@/lib/auth/auth-client';

const UserProfile = () => {
  const { theme, setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const { isSidebarCollapsed } = useDashboard();
  const router = useRouter();

  // TODO: Handle this more gracefully
  if (isPending || !session) return null;
  const { user } = session;

  const logoutUser = () => {
    signOut();
    router.replace('/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserProfileAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top" align="start">
        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logoutUser}>
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
