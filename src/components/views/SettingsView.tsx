/**
 * Settings view
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody, Button } from '../ui';
import { Settings as SettingsIcon, Info, Trash2, Edit, Plus } from 'lucide-react';

export interface SettingsViewProps {
  pipelines: Array<{ id: string; name: string }>;
  currentPipelineId: string;
  onAddPipeline: () => void;
  onRenamePipeline: (id: string, name: string) => void;
  onDeletePipeline: (id: string) => void;
}

export function SettingsView({
  pipelines,
  currentPipelineId,
  onAddPipeline,
  onRenamePipeline,
  onDeletePipeline
}: SettingsViewProps) {
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (pipeline: { id: string; name: string }) => {
    setEditingPipeline(pipeline.id);
    setEditName(pipeline.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onRenamePipeline(id, editName.trim());
      setEditingPipeline(null);
    }
  };

  const handleDelete = (id: string) => {
    if (id === currentPipelineId) {
      alert('Vous ne pouvez pas supprimer le pipeline actif. Basculez vers un autre pipeline d\'abord.');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pipeline? Tous les leads associés seront supprimés.')) {
      onDeletePipeline(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon size={20} />
              <CardTitle>Gestion des Pipelines</CardTitle>
            </div>
            <Button size="sm" onClick={onAddPipeline} icon={<Plus size={16} />}>
              Nouveau Pipeline
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {pipelines.map(pipeline => (
              <div
                key={pipeline.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  pipeline.id === currentPipelineId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {editingPipeline === pipeline.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(pipeline.id);
                        if (e.key === 'Escape') setEditingPipeline(null);
                      }}
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(pipeline.id)}>
                      Enregistrer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPipeline(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{pipeline.name}</p>
                      {pipeline.id === currentPipelineId && (
                        <p className="text-xs text-blue-600">Pipeline actif</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(pipeline)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Renommer"
                      >
                        <Edit size={16} />
                      </button>
                      {pipelines.length > 1 && (
                        <button
                          onClick={() => handleDelete(pipeline.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                          title="Supprimer"
                          disabled={pipeline.id === currentPipelineId}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} />
            <CardTitle>Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Stockage des données</h3>
              <p className="text-sm text-gray-600">
                Les données sont stockées localement dans votre navigateur (localStorage).
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Synchronisation Supabase</h3>
              <p className="text-sm text-gray-600">
                {import.meta.env.VITE_SUPABASE_URL
                  ? '✓ Configuré - Les données sont synchronisées avec Supabase'
                  : '✗ Non configuré - Utilisant uniquement le stockage local'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={20} />
            <CardTitle>À propos</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Application:</strong> Simple CRM</p>
            <p className="text-gray-600 mt-4">
              CRM simple et puissant pour gérer vos leads efficacement.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
