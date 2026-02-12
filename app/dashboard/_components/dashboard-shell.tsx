'use client';

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
import CollapsedSidebar from './sidebar/collapsed-sidebar';
import DashboardHeader from './dashboard-header';
import { EmailMessage } from '@/lib/types/aurinko';

interface DashboardShellProps {
  accounts: MailAccount[];
  threads: ThreadListItem[];
  folderInfo: FolderInfo;
  count: number | undefined;
  emails: EmailMessage[] | undefined;
}

const DashboardShell = ({
  accounts,
  threads,
  folderInfo,
  count,
  emails,
}: DashboardShellProps) => {
  const { sidebarRef, isSidebarCollapsed, setIsSidebarCollapsed } =
    useDashboard();

  return (
    <div className="h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="dashboard-layout"
          className="h-full"
        >
          <ResizablePanel
            ref={sidebarRef}
            defaultSize={20}
            minSize={20}
            maxSize={20}
            collapsible
            collapsedSize={5}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
          >
            {isSidebarCollapsed ? (
              <CollapsedSidebar accounts={accounts} folderInfo={folderInfo} />
            ) : (
              <Sidebar accounts={accounts} folderInfo={folderInfo} />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={26} minSize={20} maxSize={35}>
            <EmailList threads={threads} count={count} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={58}>
            <EmailDetail emails={emails} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default DashboardShell;
