/**
 * Sidebar navigation — aligned on Monday/Linear density.
 * Default width 220px, collapsed 56px. Uses design tokens for all surfaces.
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
  onDeletePipeline,
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
    { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { id: 'pipeline', icon: <Layers size={16} />, label: 'Pipeline' },
    { id: 'table', icon: <Table size={16} />, label: 'Tableau' },
    { id: 'today', icon: <Calendar size={16} />, label: 'Activité' },
    { id: 'settings', icon: <Settings size={16} />, label: 'Paramètres' },
  ];

  const handleRename = (pipeline: Pipeline) => {
    const newName = prompt('Nouveau nom du pipeline :', pipeline.name);
    if (newName && newName.trim() && newName !== pipeline.name) {
      onRenamePipeline(pipeline.id, newName.trim());
    }
    setOpenMenuId(null);
  };

  const handleDelete = (pipeline: Pipeline) => {
    if (confirm(`Supprimer le pipeline « ${pipeline.name} » ?`)) {
      onDeletePipeline(pipeline.id);
    }
    setOpenMenuId(null);
  };

  useEffect(() => {
    if (!openMenuId) return;
    const onClick = () => setOpenMenuId(null);
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [openMenuId]);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border transition-[width] duration-200',
        'bg-surface',
        collapsed ? 'w-14' : 'w-[220px]'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center border-b border-border',
          collapsed ? 'h-14 px-2 justify-center' : 'h-14 px-4 justify-between'
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-[color:var(--color-text)] whitespace-nowrap">
              Simple CRM
            </h1>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="p-1.5 rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface-2 hover:text-[color:var(--color-text)]"
          title={collapsed ? 'Déplier' : 'Replier'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className={cn('pt-3', collapsed ? 'px-1.5' : 'px-2')}>
          {!collapsed && <SidebarSectionLabel>Navigation</SidebarSectionLabel>}
          <ul className="space-y-0.5">
            {views.map((view) => {
              const active = currentView === view.id;
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    onClick={() => onViewChange(view.id)}
                    title={collapsed ? view.label : undefined}
                    className={cn(
                      'group w-full flex items-center rounded-sm text-[13px] transition-colors',
                      collapsed ? 'h-9 justify-center' : 'h-8 gap-2.5 px-2',
                      active
                        ? 'bg-primary-soft text-primary-soft-text font-medium'
                        : 'text-[color:var(--color-text-body)] hover:bg-surface-2 hover:text-[color:var(--color-text)]'
                    )}
                  >
                    <span
                      className={cn(
                        'shrink-0',
                        active ? 'text-primary' : 'text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text-body)]'
                      )}
                    >
                      {view.icon}
                    </span>
                    {!collapsed && <span className="truncate">{view.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pipelines */}
        <div className={cn('mt-5 pb-3', collapsed ? 'px-1.5' : 'px-2')}>
          {!collapsed ? (
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-caption">Pipelines</span>
              <button
                type="button"
                onClick={onNewPipeline}
                className="p-1 rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface-2 hover:text-primary"
                title="Nouveau pipeline"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onNewPipeline}
              className="w-full h-9 flex items-center justify-center rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface-2 hover:text-primary mb-1"
              title="Nouveau pipeline"
            >
              <Plus size={14} />
            </button>
          )}

          {pipelines.length === 0 ? (
            !collapsed && (
              <p className="px-2 py-1.5 text-[11px] text-[color:var(--color-text-subtle)] italic">
                Aucun pipeline
              </p>
            )
          ) : (
            <ul className="space-y-0.5">
              {pipelines.map((pipeline) => {
                const active = currentPipelineId === pipeline.id;
                const menuOpen = openMenuId === pipeline.id;
                return (
                  <li key={pipeline.id} className="relative group/pipeline">
                    <button
                      type="button"
                      onClick={() => onPipelineChange(pipeline.id)}
                      title={pipeline.name}
                      className={cn(
                        'w-full flex items-center rounded-sm transition-colors',
                        collapsed
                          ? 'h-9 justify-center text-[10px] font-semibold uppercase'
                          : 'h-8 gap-2 px-2 text-[13px]',
                        active
                          ? 'bg-surface-2 text-[color:var(--color-text)] font-medium'
                          : 'text-[color:var(--color-text-body)] hover:bg-surface-2 hover:text-[color:var(--color-text)]'
                      )}
                    >
                      {collapsed ? (
                        <span>{pipeline.name.slice(0, 2).toUpperCase()}</span>
                      ) : (
                        <>
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0',
                              active ? 'bg-primary' : 'bg-[color:var(--color-border-strong)]'
                            )}
                          />
                          <span className="flex-1 text-left truncate">{pipeline.name}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(menuOpen ? null : pipeline.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(menuOpen ? null : pipeline.id);
                              }
                            }}
                            className="opacity-0 group-hover/pipeline:opacity-100 p-0.5 rounded-sm text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-border)] hover:text-[color:var(--color-text)] transition-opacity"
                            aria-label="Actions pipeline"
                          >
                            <MoreVertical size={13} />
                          </span>
                        </>
                      )}
                    </button>

                    {menuOpen && (
                      <div className="absolute right-1 top-full mt-1 w-40 bg-surface border border-border rounded-md shadow-md z-dropdown overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleRename(pipeline)}
                          className="w-full text-left px-3 py-2 text-[13px] text-[color:var(--color-text-body)] hover:bg-surface-2 flex items-center gap-2"
                        >
                          <Edit2 size={13} />
                          Renommer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pipeline)}
                          className="w-full text-left px-3 py-2 text-[13px] text-danger hover:bg-danger-soft flex items-center gap-2"
                        >
                          <Trash2 size={13} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border text-[11px] text-[color:var(--color-text-subtle)]">
          v2.0.0
        </div>
      )}
    </aside>
  );
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-caption px-2 mb-1.5">{children}</p>;
}
