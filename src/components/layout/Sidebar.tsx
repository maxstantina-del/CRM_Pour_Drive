/**
 * Sidebar navigation component
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Table,
  Calendar,
  Settings,
  Plus,
  MoreVertical,
  Edit2,
  Trash2
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
  onRenamePipeline: (pipelineId: string, newName: string) => void;
  onDeletePipeline: (pipelineId: string) => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  pipelines,
  currentPipelineId,
  onPipelineChange,
  onNewPipeline,
  onRenamePipeline,
  onDeletePipeline
}: SidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'pipeline', icon: <Layers size={20} />, label: 'Pipeline' },
    { id: 'table', icon: <Table size={20} />, label: 'Tableau' },
    { id: 'today', icon: <Calendar size={20} />, label: "Aujourd'hui" },
    { id: 'settings', icon: <Settings size={20} />, label: 'Paramètres' }
  ];

  const handleRename = (pipeline: Pipeline) => {
    const newName = prompt('Nouveau nom du pipeline:', pipeline.name);
    if (newName && newName.trim() && newName !== pipeline.name) {
      onRenamePipeline(pipeline.id, newName.trim());
    }
    setOpenMenuId(null);
  };

  const handleDelete = (pipeline: Pipeline) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le pipeline "${pipeline.name}" ?`)) {
      onDeletePipeline(pipeline.id);
    }
    setOpenMenuId(null);
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

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
            {pipelines.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-2 px-3">
                Aucun pipeline
              </div>
            ) : (
              pipelines.map(pipeline => (
              <div key={pipeline.id} className="relative group">
                <button
                  onClick={() => onPipelineChange(pipeline.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate flex items-center justify-between',
                    currentPipelineId === pipeline.id
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                  title={pipeline.name}
                >
                  <span className="truncate">{pipeline.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === pipeline.id ? null : pipeline.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                    title="Actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </button>

                {/* Dropdown Menu */}
                {openMenuId === pipeline.id && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => handleRename(pipeline)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <Edit2 size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(pipeline)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              ))
            )}
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
