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
  Trash2,
  PanelLeftClose,
  PanelLeft,
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

const SIDEBAR_STORAGE_KEY = 'crm_sidebar_collapsed';

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
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'; } catch { return false; }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0'); } catch { /* quota */ }
      return next;
    });
  };

  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'pipeline', icon: <Layers size={20} />, label: 'Pipeline' },
    { id: 'table', icon: <Table size={20} />, label: 'Tableau' },
    { id: 'today', icon: <Calendar size={20} />, label: 'Activité' },
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
    <aside className={cn(
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-200',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo/Brand */}
      <div className={cn(
        'border-b border-gray-200 dark:border-gray-800 flex items-center',
        collapsed ? 'p-3 justify-center' : 'p-6 justify-between'
      )}>
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Simple CRM</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestion de leads</p>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          title={collapsed ? 'Déplier' : 'Replier'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1 overflow-y-auto overflow-x-hidden', collapsed ? 'p-2' : 'p-4')}>
        <div className="mb-6">
          {!collapsed && (
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h2>
          )}
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              title={collapsed ? view.label : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                currentView === view.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {view.icon}
              {!collapsed && view.label}
            </button>
          ))}
        </div>

        {/* Pipelines */}
        <div>
          {!collapsed ? (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pipelines
              </h2>
              <button
                onClick={onNewPipeline}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                title="Nouveau pipeline"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onNewPipeline}
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 mb-1"
              title="Nouveau pipeline"
            >
              <Plus size={18} />
            </button>
          )}
          <div className="space-y-1">
            {pipelines.length === 0 ? (
              !collapsed && (
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-2 px-3">
                  Aucun pipeline
                </div>
              )
            ) : (
              pipelines.map(pipeline => (
              <div key={pipeline.id} className="relative group">
                <button
                  onClick={() => onPipelineChange(pipeline.id)}
                  className={cn(
                    'w-full rounded-lg text-sm transition-colors',
                    collapsed
                      ? 'flex items-center justify-center p-2.5 font-semibold uppercase'
                      : 'text-left px-3 py-2 flex items-center justify-between truncate',
                    currentPipelineId === pipeline.id
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                  title={pipeline.name}
                >
                  {collapsed ? (
                    <span>{pipeline.name.slice(0, 2).toUpperCase()}</span>
                  ) : (
                    <span className="truncate">{pipeline.name}</span>
                  )}
                  {!collapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === pipeline.id ? null : pipeline.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                      title="Actions"
                    >
                      <MoreVertical size={14} />
                    </button>
                  )}
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
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 Simple CRM</p>
          <p className="mt-1">Version 2.0.0</p>
        </div>
      )}
    </aside>
  );
}
