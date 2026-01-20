'use client';

import { createContext } from 'react';

import { DashboardContextValue } from '@/lib/types/contexts';

export const DashboardContext = createContext<DashboardContextValue | null>(
  null
);
