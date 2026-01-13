import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, List, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Pipeline } from '../../lib/types';
import logoImg from '/logo.jpg';

interface SidebarProps {
  currentView: 'dashboard' | 'pipeline' | 'table' | 'today' | 'settings';
  onViewChange: (view: 'dashboard' | 'pipeline' | 'table' | 'today' | 'settings') => void;
  pipelines: Pipeline[];
  currentPipelineId: string;
  onPipelineChange: (id: string) => void;
  onCreatePipeline: () => void;
  onRenamePipeline: () => void;
  onDeletePipeline: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  pipelines,
  currentPipelineId,
  onPipelineChange,
  onCreatePipeline,
  onRenamePipeline,
  onDeletePipeline,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline' as const, label: 'Pipeline', icon: Users },
    { id: 'table' as const, label: 'Tous les Leads', icon: List },
    { id: 'today' as const, label: "Aujourd'hui", icon: Calendar },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed left-0 top-0 h-full glass border-r border-white/10 transition-all duration-300 z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
      <div className={`flex flex-col h-full ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Logo */}
        <div className={`flex items-center justify-center mb-6 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-0'}`}>
          <img
            src={logoImg}
            alt="Simple CRM"
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-10 h-10 rounded-lg' : 'w-full h-auto rounded-xl'}`}
          />
        </div>

        {/* Pipeline Selector */}
        {!isCollapsed && (
          <div className="mb-6 px-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Pipeline
            </label>
            <select
              value={currentPipelineId}
              onChange={(e) => onPipelineChange(e.target.value)}
              className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue mb-2"
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name} ({pipeline.leads.length})
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                onClick={onCreatePipeline}
                className="flex-1 p-2 rounded bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-gray-200 transition-colors"
                title="Nouveau pipeline"
              >
                <Plus size={14} className="mx-auto" />
              </button>
              <button
                onClick={onRenamePipeline}
                className="flex-1 p-2 rounded bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-gray-200 transition-colors"
                title="Renommer"
              >
                <Edit2 size={14} className="mx-auto" />
              </button>
              <button
                onClick={onDeletePipeline}
                className="flex-1 p-2 rounded bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={14} className="mx-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }
                `}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* Server Status */}
        {!isCollapsed && (
          <div className="mt-auto px-2 py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">Mode Local (Sans Cloud)</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={`mt-2 ${isCollapsed ? 'px-2' : 'px-4'} py-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors text-sm flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
    </motion.aside>
    </>
  );
}
