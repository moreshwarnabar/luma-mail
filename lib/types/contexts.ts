import { Dispatch, RefObject, SetStateAction } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

export interface DashboardContextValue {
  selectedThreadId: string | null;
  setSelectedThreadId: Dispatch<SetStateAction<string | null>>;
  isComposing: boolean;
  setIsComposing: Dispatch<SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  sidebarRef: RefObject<ImperativePanelHandle | null>;
  toggleSidebar: () => void;
}
