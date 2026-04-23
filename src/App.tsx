import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { Sidebar, Header, Container } from './components/layout';
import { PipelineView } from './components/pipeline';
import { LeadForm } from './components/forms';
import { InputModal } from './components/modals/InputModal';
import { WinCelebration } from './components/celebration';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { LeadDetailsModal } from './components/modals/LeadDetailsModal';
import { OnboardingTour, useOnboarding } from './components/onboarding/OnboardingTour';

const DashboardView = lazy(() => import('./components/dashboard').then(m => ({ default: m.DashboardView })));
const TableView = lazy(() => import('./components/views').then(m => ({ default: m.TableView })));
const TodayView = lazy(() => import('./components/views').then(m => ({ default: m.TodayView })));
const SettingsView = lazy(() => import('./components/views/SettingsView').then(m => ({ default: m.SettingsView })));
const ImportWizard = lazy(() => import('./components/modals/ImportWizard').then(m => ({ default: m.ImportWizard })));
const ChatAgent = lazy(() => import('./components/ai/ChatAgent').then(m => ({ default: m.ChatAgent })));
import { BulkActionBar } from './components/bulk';
import { FilterButton, ActiveFilterChips } from './components/filters';
import { useLeadFilters } from './hooks/useLeadFilters';
import { useTags } from './hooks/useTags';
import { applyLeadFilters, extractCities } from './lib/leadFilters';
import { usePipelines } from './hooks/usePipelines';
import { useLeads } from './hooks/useLeads';
import { useActivityReminders } from './hooks/useActivityReminders';
import { useAllFiches } from './contexts/FichesContext';
import { updateFiche as updateFicheService } from './services/fichesService';
import { diffFicheFromLead, hasAnyFicheSync } from './lib/leadFicheSync';
import { Layers, Plus } from 'lucide-react';
import { useToast } from './contexts/ToastContext';
import { usePipelineStages } from './hooks/usePipelineStages';
import { useBackup } from './hooks/useBackup';
import type { Lead, ViewType } from './lib/types';
import { generateId } from './lib/utils';
import { createActivity } from './services/activitiesService';
import { fireWinConfetti } from './lib/confetti';
import { captureFeatureException } from './lib/sentry';
import { ViewErrorBoundary } from './components/ViewErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { SearchBar } from './components/layout/SearchBar';

function App() {
  // Charger la dernière vue depuis localStorage ou utiliser 'pipeline' par défaut
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('crm_current_view');
    return (savedView as ViewType) || 'pipeline';
  });

  /** Incremented each time the header Activity badge is clicked. TodayView
   * listens to this and re-opens the Aujourd'hui bucket + scrolls to top so
   * the user always gets visible feedback, even when already on that view. */
  const [activityFocusKey, setActivityFocusKey] = useState(0);

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

  const { stages, addStage, updateStage, removeStage, reorderStages } = usePipelineStages();
  const { tags, leadTags, toggleLeadTag, getTagsForLead } = useTags();

  const effectivePipelineId = currentPipelineId || pipelines[0]?.id || '';
  const allLeads = effectivePipelineId ? getPipelineLeads(effectivePipelineId) : [];

  const { fichesByLead } = useAllFiches();
  useActivityReminders(allLeads, fichesByLead);

  const { filters, setFilters, updateFilter, resetFilters, activeCount } = useLeadFilters();

  const citiesOptions = useMemo(() => extractCities(allLeads), [allLeads]);

  const tagIdsByLead = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const [leadId, list] of leadTags) m.set(leadId, list.map((t) => t.id));
    return m;
  }, [leadTags]);

  const leads = useMemo(
    () => applyLeadFilters(allLeads, filters, tagIdsByLead),
    [allLeads, filters, tagIdsByLead]
  );

  const currentPipelineName = useMemo(
    () => pipelines.find((p) => p.id === effectivePipelineId)?.name,
    [pipelines, effectivePipelineId]
  );

  const pageMeta = useMemo((): { title: string; context?: string } => {
    switch (currentView) {
      case 'dashboard':
        return { title: 'Dashboard' };
      case 'pipeline':
        return { title: 'Pipeline', context: currentPipelineName };
      case 'table':
        return { title: 'Tableau', context: currentPipelineName };
      case 'today':
        return { title: 'Activité' };
      case 'settings':
        return { title: 'Paramètres' };
      default:
        return { title: 'Simple CRM' };
    }
  }, [currentView, currentPipelineName]);

  const searchQuery = filters.search;
  const setSearchQuery = (v: string) => updateFilter('search', v);

  // Create leads manager with optimized single-lead operations
  const leadsManager = useMemo(() => {
    return {
      addLead: async (leadData: Partial<Lead>) => {
        const now = new Date().toISOString();
        const newLead: Lead = {
          id: generateId(),
          name: leadData.name || leadData.company || 'Nouveau Lead',
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
        const prev = leads.find((l) => l.id === leadId);
        await updateSingleLead(effectivePipelineId, leadId, updates);
        // Propagate contact/address changes to every fiche on this lead so
        // the fiche keeps matching the lead. Only fiches whose value still
        // matches the OLD lead value get updated — manually customized fiches
        // keep their tailored value.
        if (prev) {
          const next = { ...prev, ...updates } as Lead;
          const fiches = fichesByLead.get(leadId) ?? [];
          for (const fiche of fiches) {
            const ficheDiff = diffFicheFromLead(fiche, prev, next);
            if (hasAnyFicheSync(ficheDiff)) {
              try {
                await updateFicheService(fiche.id, ficheDiff);
              } catch (err) {
                console.error('Fiche sync from lead failed', err);
              }
            }
          }
        }
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
  }, [effectivePipelineId, addSingleLead, updateSingleLead, deleteSingleLead, leads, fichesByLead]);

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
  const handleUpdateStage = useCallback(async (leadId: string, newStage: Lead['stage']) => {
    const lead = leads.find(l => l.id === leadId);
    const isWon = newStage === 'won' || newStage === 'closed_won';
    const wasWon = lead?.stage === 'won' || lead?.stage === 'closed_won';
    const previousStage = lead?.stage;

    if (lead && isWon && !wasWon) {
      setCelebration({ isVisible: true, leadName: lead.name });
      showToast(`🏆 ${lead.name} est gagné !`, 'success');
      fireWinConfetti();
      setTimeout(() => {
        setCelebration({ isVisible: false, leadName: '' });
      }, 1800);
    }

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
      captureFeatureException('pipeline-drag', error, { leadId, newStage, previousStage });
      if (previousStage) {
        await updateSingleLead(effectivePipelineId, leadId, { stage: previousStage });
      }
      showToast('❌ Erreur: mise à jour annulée', 'error');
    }
  }, [leads, effectivePipelineId, updateSingleLead, user, showToast]);

  const handleNewLead = useCallback(() => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  }, []);

  const handleViewLead = useCallback((lead: Lead) => setViewingLead(lead), []);

  const handleDeleteLead = useCallback(async (leadId: string) => {
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
  }, [leadsManager, showToast]);

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
          captureFeatureException('bulk-action', err, { op: 'delete', count: ids.length });
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
      captureFeatureException('bulk-action', err, { op: 'change-stage', count: ids.length, stageId });
      showToast('Erreur lors du changement d\'étape', 'error');
    }
  };

  const handleSubmitLead = async (
    leadData: Partial<Lead>,
    extras?: { tagIds: string[]; nextAction?: { text: string; dueDate: string } }
  ) => {
    // Merge the new nextAction (if any) into the lead's existing nextActions array
    const newNextAction = extras?.nextAction
      ? {
          id: generateId(),
          text: extras.nextAction.text,
          completed: false,
          dueDate: extras.nextAction.dueDate,
          createdAt: new Date().toISOString(),
        }
      : null;

    let targetLead: Lead | null = null;

    if (editingLead) {
      const mergedNextActions = newNextAction
        ? [...(editingLead.nextActions ?? []), newNextAction]
        : editingLead.nextActions;
      await leadsManager.updateLead(editingLead.id, { ...leadData, nextActions: mergedNextActions });
      targetLead = editingLead;
      showToast('Lead modifié', 'success');
    } else {
      const created = await leadsManager.addLead({
        ...leadData,
        nextActions: newNextAction ? [newNextAction] : [],
      });
      targetLead = created;
      showToast('Lead créé', 'success');
    }

    // Sync tags: add new selections, remove unselected ones (for edit).
    if (targetLead && extras?.tagIds) {
      const currentIds = new Set(getTagsForLead(targetLead.id).map((t) => t.id));
      const desiredIds = new Set(extras.tagIds);
      const toAdd = extras.tagIds.filter((id) => !currentIds.has(id));
      const toRemove = Array.from(currentIds).filter((id) => !desiredIds.has(id));
      const allToToggle = [...toAdd, ...toRemove];
      for (const tagId of allToToggle) {
        const tag = tags.find((t) => t.id === tagId);
        if (tag) {
          try { await toggleLeadTag(targetLead.id, tag); } catch (err) { console.error(err); }
        }
      }
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
      name: d.name || d.company || 'Nouveau Lead',
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
          leads={allLeads}
          pageTitle={pageMeta.title}
          pageContext={pageMeta.context}
          onNewLead={handleNewLead}
          onImport={handleImportClick}
          onExport={handleExportCSV}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onOpenLead={(leadId) => {
            const lead = allLeads.find((l) => l.id === leadId);
            if (lead) setViewingLead(lead);
          }}
          onGoToActivity={() => {
            setCurrentView('today');
            setActivityFocusKey((k) => k + 1);
          }}
        />

        {pipelines.length > 0 && (
          <div className="px-4 py-2 border-b border-border bg-surface space-y-2">
            <div className="flex items-center gap-2">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher nom, company, ville, email…" />
              <FilterButton
                activeCount={activeCount}
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                cities={citiesOptions}
                stages={stages}
                tags={tags}
              />
              {(activeCount > 0 || searchQuery) && (
                <span className="text-[12px] text-[color:var(--color-text-muted)] ml-auto">
                  {leads.length} / {allLeads.length} leads
                </span>
              )}
            </div>
            <ActiveFilterChips
              filters={filters}
              onChange={setFilters}
              onClearAll={resetFilters}
              stages={stages}
              tags={tags}
            />
          </div>
        )}

        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                Chargement…
              </div>
            }
          >
          {currentView === 'dashboard' && (
            <ViewErrorBoundary feature="dashboard" viewName="Dashboard">
              <DashboardView leads={leads} stages={stages} />
            </ViewErrorBoundary>
          )}

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
              <ViewErrorBoundary feature="pipeline-drag" viewName="Pipeline">
                <PipelineView
                  leads={leads}
                  stages={stages}
                  onUpdateStage={handleUpdateStage}
                  onEditLead={handleEditLead}
                  onDeleteLead={handleDeleteLead}
                  onViewLead={handleViewLead}
                  tagsByLead={leadTags}
                />
              </ViewErrorBoundary>
            )
          )}

          {currentView === 'table' && (
            <ViewErrorBoundary feature="lead-crud" viewName="Tableau">
              <TableView
                leads={leads}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
                onUpdateStage={handleUpdateStage}
                onViewLead={handleViewLead}
                selectedIds={selectedLeadIds}
                onSelectionChange={setSelectedLeadIds}
                tagsByLead={leadTags}
              />
            </ViewErrorBoundary>
          )}

          {currentView === 'today' && (
            <ViewErrorBoundary feature="activity" viewName="Activité">
              <TodayView
                leads={leads}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
                onUpdateStage={handleUpdateStage}
                onViewLead={handleViewLead}
                focusKey={activityFocusKey}
              />
            </ViewErrorBoundary>
          )}

          {currentView === 'settings' && (
            <ViewErrorBoundary feature="settings" viewName="Paramètres">
              <SettingsView
                pipelines={pipelines}
                currentPipelineId={effectivePipelineId}
                onAddPipeline={handleNewPipeline}
                onRenamePipeline={renamePipeline}
                onDeletePipeline={handleDeletePipeline}
                stages={stages}
                onAddStage={addStage}
                onUpdateStage={updateStage}
                onRemoveStage={removeStage}
                onReorderStages={reorderStages}
              />
            </ViewErrorBoundary>
          )}
          </Suspense>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFormOpen(false);
              setEditingLead(undefined);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
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

      {isImportWizardOpen && (
        <Suspense fallback={null}>
          <ImportWizard
            isOpen={isImportWizardOpen}
            onClose={() => setIsImportWizardOpen(false)}
            onImport={handleImport}
            currentPipelineId={effectivePipelineId}
            pipelines={pipelines}
          />
        </Suspense>
      )}

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
        lead={viewingLead ? allLeads.find((l) => l.id === viewingLead.id) ?? viewingLead : null}
        onClose={() => setViewingLead(null)}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
        onAddNextAction={(leadId, text, dueDate) => leadsManager.addNextAction(leadId, text, dueDate)}
        onToggleNextAction={(leadId, actionId) => leadsManager.toggleNextAction(leadId, actionId)}
        onDeleteNextAction={(leadId, actionId) => leadsManager.deleteNextAction(leadId, actionId)}
        onUpdateLead={leadsManager.updateLead}
      />

      <WinCelebration
        isVisible={celebration.isVisible}
        leadName={celebration.leadName}
      />

      <OnboardingTour isOpen={shouldShowTour} onComplete={completeTour} />

      <Suspense fallback={null}>
        <ChatAgent
          leads={leads}
          onCreateLead={leadsManager.addLead}
          onUpdateLead={leadsManager.updateLead}
        />
      </Suspense>
    </Container>
  );
}

export default App;
