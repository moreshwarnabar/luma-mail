export interface DashboardContextValue {
  selectedThreadId: string | null;
  setSelectedThreadId: (selectedThreadId: string) => void;
  isComposing: boolean;
  setIsComposing: (isComposing: boolean) => void;
}
