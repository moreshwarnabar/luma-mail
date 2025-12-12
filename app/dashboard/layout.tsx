import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/modules/email/components/app-sidebar';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full h-screen">{children}</div>
    </SidebarProvider>
  );
};

export default Layout;
