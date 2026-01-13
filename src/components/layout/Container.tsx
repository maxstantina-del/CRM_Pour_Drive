import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  isSidebarCollapsed: boolean;
}

export function Container({ children, isSidebarCollapsed }: ContainerProps) {
  return (
    <div className={`transition-all duration-300 min-h-screen ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      {children}
    </div>
  );
}
