import React from 'react';
import DashboardProvider from './_components/dashboard-provider';

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <DashboardProvider>{children}</DashboardProvider>;
};

export default Layout;
