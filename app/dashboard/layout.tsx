import React from 'react';

import AppSidebarServer from '@/modules/dashboard/server/app-sidebar-server';
import DashboardShell from '@/modules/dashboard/client/dashboard-shell';

interface Props {
  children: React.ReactNode;
  searchParams: { accountId?: string; folder?: string };
}

const Layout = ({ children, searchParams }: Props) => {
  return (
    <DashboardShell
      sidebar={<AppSidebarServer accountId={searchParams?.accountId} />}
    >
      {children}
    </DashboardShell>
  );
};

export default Layout;
