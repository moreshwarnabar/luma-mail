'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import Sidebar from './sidebar/sidebar';
import EmailList from './email-list/email-list';
import EmailDetail from './email-detail/email-detail';

const DashboardShell = () => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={16} minSize={15} maxSize={20}>
        <Sidebar />
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
