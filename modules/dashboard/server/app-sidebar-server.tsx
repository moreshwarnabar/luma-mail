import React from 'react';
import AppSidebarClient from '../client/app-sidebar-client';

const AppSidebarServer = ({ selAccId }: { selAccId?: string }) => {
  return <AppSidebarClient />;
};

export default AppSidebarServer;
