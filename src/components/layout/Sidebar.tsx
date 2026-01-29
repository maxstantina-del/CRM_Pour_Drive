/**
 * Sidebar navigation component
 */

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Table,
  Calendar,
  Settings,
  Plus
} from 'lucide-react';
import type { ViewType, Pipeline } from '../../lib/types';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  pipelines: Pipeline[];
  currentPipelineId: string;
  onPipelineChange: (pipelineId: string) => void;
  onNewPipeline: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  pipelines,
  currentPipelineId,
  onPipelineChange,
  onNewPipeline
}: SidebarProps) {
  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'pipeline', icon: <Layers size={20} />, label: 'Pipeline' },
    { id: 'table', icon: <Table size={20} />, label: 'Tableau' },
    { id: 'today', icon: <Calendar size={20} />, label: "Aujourd'hui" },
    { id: 'settings', icon: <Settings size={20} />, label: 'Paramètres' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Simple CRM</h1>
        <p className="text-sm text-gray-500 mt-1">Gestion de leads</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h2>
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === view.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        {/* Pipelines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pipelines
            </h2>
            <button
              onClick={onNewPipeline}
              className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
              title="Nouveau pipeline"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {pipelines.map(pipeline => (
              <button
                key={pipeline.id}
                onClick={() => onPipelineChange(pipeline.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate',
                  currentPipelineId === pipeline.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                title={pipeline.name}
              >
                {pipeline.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>© 2025 Simple CRM</p>
        <p className="mt-1">Version 2.0.0</p>
      </div>
    </aside>
  );
}
