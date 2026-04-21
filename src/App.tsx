import { useState, useMemo, useEffect } from 'react';
import { Sidebar, Header, Container } from './components/layout';
import { DashboardView } from './components/dashboard';
import { PipelineView } from './components/pipeline';
import { TableView, TodayView } from './components/views';
import { SettingsView } from './components/views/SettingsView';
import { LeadForm } from './components/forms';
import { ImportWizard } from './components/modals/ImportWizard';
import { InputModal } from './components/modals/InputModal';
import { WinCelebration } from './components/celebration';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { LeadDetailsModal } from './components/modals/LeadDetailsModal';
import { OnboardingTour, useOnboarding } from './components/onboarding/OnboardingTour';
import { ChatAgent } from './components/ai/ChatAgent';
import { BulkActionBar } from './components/bulk';
import { usePipelines } from './hooks/usePipelines';
import { useLeads } from './hooks/useLeads';
import { Layers, Plus } from 'lucide-react';
import { useToast } from './contexts/ToastContext';
import { usePipelineStages } from './hooks/usePipelineStages';
import { useBackup } from './hooks/useBackup';
import type { Lead, ViewType } from './lib/types';
import { generateId } from './lib/utils';
import { createActivity } from './services/activitiesService';
import { useAuth } from './contexts/AuthContext';
import { SearchBar } from './components/layout/SearchBar';

function App() {
  // Charger la dernière vue depuis localStorage ou utiliser 'pipeline' par défaut
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('crm_current_view');
    return (savedView as ViewType) || 'pipeline';
  });

  // Sauvegarder la vue actuelle dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('crm_current_view', currentView);
  }, [currentView]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [celebration, setCelebration] = useState<{ isVisible: boolean; leadName: string }>({
    isVisible: false,
    leadName: ''
  });
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    initialValue?: string;
    onSubmit: ((value: string) => void) | null;
  }>({
    isOpen: false,
    title: '',
    onSubmit: null
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Clear selection when leaving the table view
  useEffect(() => {
    if (currentView !== 'table') setSelectedLeadIds(new Set());
  }, [currentView]);

  const { showToast } = useToast();
  const { shouldShowTour, completeTour } = useOnboarding();
  const { user } = useAuth();

  const {
    pipelines,
    currentPipelineId,
    setCurrentPipelineId,
    addPipeline,
    renamePipeline,
    deletePipeline
  } = usePipelines();

  const {
    getPipelineLeads,
    addLead: addSingleLead,
    updateLead: updateSingleLead,
    deleteLead: deleteSingleLead,
    addBatchLeads,
    bulkDelete,
    bulkUpdate,
    deletePipelineLeads,
  } = useLeads();

  const { stages } = usePipelineStages();

  const effectivePipelineId = currentPipelineId || pipelines[0]?.id || '';
  const allLeads = effectivePipelineId ? getPipelineLeads(effectivePipelineId) : [];
  const [searchQuery, setSearchQuery] = useState('');
  const leads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allLeads;
    return allLeads.filter(l => {
      const hay = [l.name, l.company, l.contactName, l.email, l.phone, l.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allLeads, searchQuery]);

  // Create leads manager with optimized single-lead operations
  const leadsManager = useMemo(() => {
    return {
      addLead: async (leadData: Partial<Lead>) => {
        const now = new Date().toISOString();
        const newLead: Lead = {
          id: generateId(),
          name: leadData.name || 'Nouveau Lead',
          contactName: leadData.contactName,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          siret: leadData.siret,
          address: leadData.address,
          city: leadData.city,
          zipCode: leadData.zipCode,
          country: leadData.country || 'France',
          stage: leadData.stage || 'new',
          value: leadData.value,
          probability: leadData.probability,
          closedDate: leadData.closedDate,
          notes: leadData.notes,
          nextActions: leadData.nextActions || [],
          createdAt: now,
          updatedAt: now,
          pipelineId: effectivePipelineId
        };
        await addSingleLead(effectivePipelineId, newLead);
        return newLead;
      },
      updateLead: async (leadId: string, updates: Partial<Lead>) => {
        await updateSingleLead(effectivePipelineId, leadId, updates);
      },
      deleteLead: async (leadId: string) => {
        await deleteSingleLead(effectivePipelineId, leadId);
      },
      addNextAction: async (leadId: string, actionText: string, dueDate?: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const newAction = {
          id: generateId(),
          text: actionText,
          completed: false,
          dueDate,
          createdAt: new Date().toISOString()
        };
        await updateSingleLead(effectivePipelineId, leadId, {
          nextActions: [...(lead.nextActions || []), newAction]
        });
      },
      toggleNextAction: async (leadId: string, actionId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || !lead.nextActions) return;
        const updatedActions = lead.nextActions.map(action =>
          action.id === actionId ? { ...action, completed: !action.completed } : action
        );
        await updateSingleLead(effectivePipelineId, leadId, { nextActions: updatedActions });
      },
      deleteNextAction: async (leadId: string, actionId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || !lead.nextActions) return;
        const updatedActions = lead.nextActions.filter(action => action.id !== actionId);
        await updateSingleLead(effectivePipelineId, leadId, { nextActions: updatedActions });
      }
    };
  }, [effectivePipelineId, addSingleLead, updateSingleLead, deleteSingleLead, leads]);

  // Backup/restore setup
  const leadsByPipeline = useMemo(() => {
    const result: Record<string, Lead[]> = {};
    pipelines.forEach(p => {
      result[p.id] = getPipelineLeads(p.id);
    });
    return result;
  }, [pipelines, getPipelineLeads]);

  // Handle pipeline deletion with leads cleanup
  const handleDeletePipeline = async (pipelineId: string) => {
    await deletePipelineLeads(pipelineId);
    await deletePipeline(pipelineId);
  };

  const { exportBackup, importBackup } = useBackup(pipelines, leadsByPipeline);

  // Event handlers
  const handleUpdateStage = async (leadId: string, newStage: Lead['stage']) => {
    const lead = leads.find(l => l.id === leadId);
    const isWon = newStage === 'won' || newStage === 'closed_won';
    const wasWon = lead?.stage === 'won' || lead?.stage === 'closed_won';
    const previousStage = lead?.stage;

    // Célébration si gagné
    if (lead && isWon && !wasWon) {
      setCelebration({ isVisible: true, leadName: lead.name });
      showToast(`🏆 ${lead.name} est gagné !`, 'success');

      setTimeout(() => {
        setCelebration({ isVisible: false, leadName: '' });
      }, 3000);
    }

    // Mise à jour optimiste + Supabase avec updateSingleLead (1 seul UPDATE!)
    try {
      await updateSingleLead(effectivePipelineId, leadId, { stage: newStage });
      if (user && previousStage && previousStage !== newStage) {
        createActivity(leadId, user.id, 'stage_change', {
          from: previousStage,
          to: newStage,
        }).catch(() => void 0);
      }
    } catch (error) {
      console.error('Erreur mise à jour stage:', error);
      // Rollback en cas d'erreur
      if (previousStage) {
        await updateSingleLead(effectivePipelineId, leadId, { stage: previousStage });
      }
      showToast('❌ Erreur: mise à jour annulée', 'error');
    }
  };

  const handleNewLead = () => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce lead ?',
      onConfirm: async () => {
        await leadsManager.deleteLead(leadId);
        showToast('Lead supprimé', 'success');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedLeadIds);
    if (ids.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Supprimer ${ids.length} lead${ids.length > 1 ? 's' : ''}`,
      message: `Êtes-vous sûr ? Cette action est irréversible.`,
      onConfirm: async () => {
        try {
          await bulkDelete(effectivePipelineId, ids);
          showToast(`${ids.length} lead${ids.length > 1 ? 's supprimés' : ' supprimé'}`, 'success');
          setSelectedLeadIds(new Set());
        } catch (err) {
          showToast('Erreur lors de la suppression', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkChangeStage = async (stageId: string) => {
    const ids = Array.from(selectedLeadIds);
    if (ids.length === 0 || !stageId) return;
    try {
      await bulkUpdate(effectivePipelineId, ids, { stage: stageId as Lead['stage'] });
      showToast(`${ids.length} lead${ids.length > 1 ? 's déplacés' : ' déplacé'}`, 'success');
      setSelectedLeadIds(new Set());
    } catch (err) {
      showToast('Erreur lors du changement d\'étape', 'error');
    }
  };

  const handleSubmitLead = async (leadData: Partial<Lead>) => {
    if (editingLead) {
      await leadsManager.updateLead(editingLead.id, leadData);
      showToast('Lead modifié', 'success');
    } else {
      await leadsManager.addLead(leadData);
      showToast('Lead créé', 'success');
    }
    setIsFormOpen(false);
    setEditingLead(undefined);
  };

  const handleImportClick = () => {
    if (pipelines.length === 0) {
      setInputModal({
        isOpen: true,
        title: 'Créer un pipeline',
        onSubmit: async (name) => {
          const newPipeline = await addPipeline(name);
          setCurrentPipelineId(newPipeline.id);
          setInputModal((prev) => ({ ...prev, isOpen: false }));
          setTimeout(() => setIsImportWizardOpen(true), 300);
        },
      });
    } else {
      setIsImportWizardOpen(true);
    }
  };

  const handleImport = async (
    importedLeads: Partial<Lead>[],
    onProgress: (p: { processed: number; total: number }) => void
  ) => {
    const targetPipelineId = currentPipelineId || pipelines[0]?.id || '';
    if (!targetPipelineId) {
      showToast('Aucun pipeline disponible', 'error');
      return { inserted: 0, errors: [{ index: -1, message: 'No pipeline' }] };
    }

    const now = new Date().toISOString();
    const newLeads: Lead[] = importedLeads.map((d) => ({
      id: generateId(),
      name: d.name || 'Nouveau Lead',
      contactName: d.contactName,
      email: d.email,
      phone: d.phone,
      company: d.company,
      siret: d.siret,
      address: d.address,
      city: d.city,
      zipCode: d.zipCode,
      country: d.country || 'France',
      stage: d.stage || 'new',
      value: d.value,
      probability: d.probability,
      closedDate: d.closedDate,
      notes: d.notes,
      nextActions: d.nextActions || [],
      createdAt: now,
      updatedAt: now,
      pipelineId: targetPipelineId,
    }));

    const result = await addBatchLeads(targetPipelineId, newLeads, onProgress);

    if (result.errors.length === 0) {
      showToast(`${result.inserted.length} leads importés`, 'success');
    } else {
      showToast(
        `${result.inserted.length} importés, ${result.errors.length} en erreur`,
        'warning'
      );
    }

    return { inserted: result.inserted.length, errors: result.errors };
  };

  const handleExportCSV = () => {
    const csv = [
      ['Nom', 'Contact', 'Email', 'Téléphone', 'Entreprise', 'Étape', 'Valeur'].join(','),
      ...leads.map(lead =>
        [
          lead.name,
          lead.contactName || '',
          lead.email || '',
          lead.phone || '',
          lead.company || '',
          lead.stage,
          lead.value || 0
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Export CSV réussi', 'success');
  };


  const handleBackup = () => {
    exportBackup();
    showToast('Sauvegarde créée', 'success');
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const result = await importBackup(file);
        if (result.success) {
          showToast('Restauration réussie', 'success');
          window.location.reload();
        } else {
          showToast(result.error || 'Erreur de restauration', 'error');
        }
      }
    };
    input.click();
  };

  const handleNewPipeline = () => {
    setInputModal({
      isOpen: true,
      title: 'Nouveau Pipeline',
      initialValue: '',
      onSubmit: async (name: string) => {
        await addPipeline(name);
        showToast('Pipeline créé', 'success');
        setInputModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <Container>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pipelines={pipelines}
        currentPipelineId={effectivePipelineId}
        onPipelineChange={setCurrentPipelineId}
        onNewPipeline={handleNewPipeline}
        onRenamePipeline={renamePipeline}
        onDeletePipeline={handleDeletePipeline}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onNewLead={handleNewLead}
          onImport={handleImportClick}
          onExport={handleExportCSV}
          onBackup={handleBackup}
          onRestore={handleRestore}
        />

        {pipelines.length > 0 && (
          <div className="px-6 py-2 border-b border-gray-200 bg-white flex items-center gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher nom, company, ville, email…" />
            {searchQuery && (
              <span className="text-xs text-gray-500">{leads.length} / {allLeads.length} leads</span>
            )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {currentView === 'dashboard' && <DashboardView leads={leads} />}

          {currentView === 'pipeline' && (
            pipelines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Layers className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Aucun pipeline
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Créez votre premier pipeline pour commencer à organiser vos leads et suivre votre processus de vente.
                  </p>
                  <button
                    onClick={handleNewPipeline}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus size={20} />
                    Créer votre premier pipeline
                  </button>
                </div>
              </div>
            ) : (
              <PipelineView
                leads={leads}
                stages={stages}
                onUpdateStage={handleUpdateStage}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
                onViewLead={(lead) => setViewingLead(lead)}
              />
            )
          )}

          {currentView === 'table' && (
            <TableView
              leads={leads}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
              onUpdateStage={handleUpdateStage}
              onViewLead={(lead) => setViewingLead(lead)}
              selectedIds={selectedLeadIds}
              onSelectionChange={setSelectedLeadIds}
            />
          )}

          {currentView === 'today' && (
            <TodayView
              leads={leads}
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
              onUpdateStage={handleUpdateStage}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              pipelines={pipelines}
              currentPipelineId={effectivePipelineId}
              onAddPipeline={handleNewPipeline}
              onRenamePipeline={renamePipeline}
              onDeletePipeline={handleDeletePipeline}
            />
          )}
        </main>
      </div>

      {currentView === 'table' && (
        <BulkActionBar
          count={selectedLeadIds.size}
          stages={stages}
          onChangeStage={handleBulkChangeStage}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedLeadIds(new Set())}
        />
      )}

      {/* Modals */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingLead ? 'Modifier le Lead' : 'Nouveau Lead'}
              </h2>
              <LeadForm
                lead={editingLead}
                onSubmit={handleSubmitLead}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingLead(undefined);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImport={handleImport}
        currentPipelineId={effectivePipelineId}
        pipelines={pipelines}
      />

      {inputModal.isOpen && inputModal.onSubmit && (
        <InputModal
          isOpen={inputModal.isOpen}
          title={inputModal.title}
          initialValue={inputModal.initialValue}
          onSubmit={inputModal.onSubmit}
          onClose={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {confirmModal.isOpen && confirmModal.onConfirm && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      <LeadDetailsModal
        isOpen={viewingLead !== null}
        lead={viewingLead}
        onClose={() => setViewingLead(null)}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
      />

      <WinCelebration
        isVisible={celebration.isVisible}
        leadName={celebration.leadName}
      />

      <OnboardingTour isOpen={shouldShowTour} onComplete={completeTour} />

      <ChatAgent
        leads={leads}
        onCreateLead={leadsManager.addLead}
        onUpdateLead={leadsManager.updateLead}
      />
    </Container>
  );
}

export default App;
