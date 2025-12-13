import React from 'react';

import AppSidebarServer from '@/modules/dashboard/server/app-sidebar-server';
import DashboardShell from '@/modules/dashboard/client/dashboard-shell';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardShell sidebar={<AppSidebarServer />}>{children}</DashboardShell>
  );
};

export default Layout;
