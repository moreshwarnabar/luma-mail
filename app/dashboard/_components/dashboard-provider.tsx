'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DashboardContext } from '@/contexts/dashboard-context';
import { ImperativePanelHandle } from 'react-resizable-panels';

const DashboardProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const sidebarRef = useRef<ImperativePanelHandle>(null);

  const toggleSidebar = useCallback(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    if (sidebar.isCollapsed()) sidebar.expand();
    else sidebar.collapse();
  }, []);

  const value = useMemo(
    () => ({
      selectedThreadId,
      setSelectedThreadId,
      isComposing,
      setIsComposing,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      sidebarRef,
      toggleSidebar,
    }),
    [selectedThreadId, isComposing, isSidebarCollapsed, toggleSidebar]
  );

  return <DashboardContext value={value}>{children}</DashboardContext>;
};

export default DashboardProvider;
