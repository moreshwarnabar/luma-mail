'use client';

import { useContext } from 'react';

import { DashboardContext } from '@/contexts/dashboard-context';

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error('useDashboard must be used within DashboardProvider');

  return context;
}
