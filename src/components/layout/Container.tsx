/**
 * Main Container layout component
 */

import React, { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {children}
    </div>
  );
}
