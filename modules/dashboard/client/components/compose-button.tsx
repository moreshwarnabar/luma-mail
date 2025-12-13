import { IoPencilOutline } from 'react-icons/io5';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const ComposeButton = () => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              className={cn(
                'py-5 px-5',
                'bg-orange-400 hover:bg-orange-300 transition-colors duration-500 ease-out'
              )}
              asChild
            >
              <a href="#" className="flex gap-4">
                <IoPencilOutline />
                <span className="font-semibold">Compose</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default ComposeButton;
