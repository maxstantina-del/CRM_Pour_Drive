import { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Lead, StageConfig } from '../../lib/types';
import { PipelineColumn } from './PipelineColumn';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { InputModal } from '../modals/InputModal';

interface PipelineViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onUpdateStage: (leadId: string, newStage: string) => void;
  onViewDetails: (lead: Lead) => void;
}

interface DraggableColumnProps {
  config: StageConfig;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewDetails: (lead: Lead) => void;
  onDrop: (leadId: string, newStage: string) => void;
  onUpdateColumn: (id: string, updates: Partial<StageConfig>) => void;
  onDeleteColumn: (id: string) => void;
}

function DraggableColumn({ config, leads, onEdit, onDelete, onViewDetails, onDrop, ...props }: DraggableColumnProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={config}
      dragListener={false}
      dragControls={dragControls}
      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px] xl:w-[280px] h-full"
    >
      <PipelineColumn
        config={config}
        leads={leads}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onDrop={onDrop}
        dragControls={dragControls}
        onUpdateColumn={props.onUpdateColumn}
        onDeleteColumn={props.onDeleteColumn}
      />
    </Reorder.Item>
  );
}

export function PipelineView({ leads, onEdit, onDelete, onUpdateStage, onViewDetails }: PipelineViewProps) {
  const { stages, reorderStages, addStage, updateStage, deleteStage } = usePipelineStages();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check if we have a valid pipeline context
  if (!stages || stages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <h2 className="text-xl font-semibold text-gray-200">Pipeline vide</h2>
        <p className="text-sm">Créez votre premier pipeline pour commencer.</p>
      </div>
    );
  }

  const groupedLeads = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter((lead) => {
      if (lead.stage === stage.id) return true;
      if (stage.id === 'won' && lead.stage === 'closed_won') return true;
      if (stage.id === 'closed_won' && lead.stage === 'won') return true;
      if (stage.id === 'lost' && lead.stage === 'closed_lost') return true;
      if (stage.id === 'closed_lost' && lead.stage === 'lost') return true;
      return false;
    });
    return acc;
  }, {} as Record<string, Lead[]>);

  // Group any leads that don't match known stages into the first stage or a fallback
  const knownStageIds = new Set(stages.map(s => s.id));
  const unknownLeads = leads.filter(l => !knownStageIds.has(l.stage));

  // Optional: Add unknown leads to the first stage to avoid data loss in UI
  if (unknownLeads.length > 0 && stages.length > 0) {
    /* 
       Optimization: Avoid destructuring huge arrays if possible, but safely adding unknowns. 
       Note: leads prop usually comes from the pipeline. leads here are likely safe. 
    */
    groupedLeads[stages[0].id] = [...(groupedLeads[stages[0].id] || []), ...unknownLeads];
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden" style={{ height: 'calc(100vh - 180px)' }}>
      <Reorder.Group
        as="div"
        axis="x"
        values={stages}
        onReorder={reorderStages}
        className="flex flex-nowrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-6 px-1.5 sm:px-2 md:px-4 lg:px-6 xl:px-8 pb-4 sm:pb-6 lg:pb-8 h-full"
        style={{ width: 'fit-content', minWidth: '100%' }}
      >

        {stages.map((stage) => (
          <DraggableColumn
            key={stage.id}
            config={stage}
            leads={groupedLeads[stage.id] || []}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            onDrop={onUpdateStage}
            onUpdateColumn={updateStage}
            onDeleteColumn={deleteStage}
          />
        ))}

        {unknownLeads.length > 0 && (
          <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px] xl:w-[280px] h-full opacity-80 border-2 border-dashed border-red-500/30 rounded-xl p-2">
            <h3 className="text-red-400 font-bold mb-2 text-center">⚠️ Non Classés ({unknownLeads.length})</h3>
            <div className="space-y-2">
              {unknownLeads.map(lead => (
                <div key={lead.id} className="bg-red-900/20 p-2 rounded text-sm text-gray-300">
                  {lead.name} ({lead.stage})
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="min-w-[50px] flex items-start justify-center pt-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/20"
            title="Ajouter une colonne"
          >
            <Plus size={24} />
          </button>
        </div>
      </Reorder.Group>

      <InputModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={(name) => {
          if (name.trim()) addStage(name.trim());
        }}
        title="Nouvelle colonne"
        placeholder="Nom de l'étape..."
      />
    </div>
  );
}
