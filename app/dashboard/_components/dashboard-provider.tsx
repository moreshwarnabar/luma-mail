'use client';

import { useMemo, useState } from 'react';

import { DashboardContext } from '@/contexts/dashboard-context';

const DashboardProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const value = useMemo(
    () => ({
      selectedThreadId,
      setSelectedThreadId,
      isComposing,
      setIsComposing,
    }),
    [selectedThreadId, isComposing]
  );

  return <DashboardContext value={value}>{children}</DashboardContext>;
};

export default DashboardProvider;
