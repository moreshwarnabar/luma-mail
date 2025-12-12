'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

interface Props {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const DashboardShell = ({ sidebar, children }: Props) => {
  return (
    <SidebarProvider>
      {sidebar}
      <div className="w-full h-screen">{children}</div>
    </SidebarProvider>
  );
};

export default DashboardShell;
