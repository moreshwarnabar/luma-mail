'use client';

import { useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import Sidebar from './sidebar/sidebar';
import EmailList from './email-list/email-list';
import EmailDetail from './email-detail/email-detail';
import { FolderInfo, MailAccount, ThreadListItem } from '@/lib/types/entities';
import { useDashboard } from '@/hooks/use-dashboard';

interface DashboardShellProps {
  accounts: MailAccount[];
  threads: ThreadListItem[];
  folderInfo: FolderInfo;
}

const DashboardShell = ({
  accounts,
  threads,
  folderInfo,
}: DashboardShellProps) => {
  const { sidebarRef, setIsSidebarCollapsed } = useDashboard();

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="dashboard-layout"
      className="h-screen"
    >
      <ResizablePanel
        ref={sidebarRef}
        defaultSize={16}
        minSize={15}
        maxSize={20}
        collapsible
        collapsedSize={4}
        onCollapse={() => setIsSidebarCollapsed(true)}
        onExpand={() => setIsSidebarCollapsed(false)}
      >
        <Sidebar accounts={accounts} folderInfo={folderInfo} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={26} minSize={20} maxSize={35}>
        <EmailList />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={58}>
        <EmailDetail />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DashboardShell;
