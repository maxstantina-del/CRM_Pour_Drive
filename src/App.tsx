import { useState, useRef, useEffect, useMemo } from 'react';
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
import { usePipelines } from './hooks/usePipelines';
import { useCustomActions } from './hooks/useCustomActions';
import { createLeadsManager } from './hooks/useLeads';
import { useToast } from './contexts/ToastContext';
import { Lead } from './lib/types';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'dashboard' | 'pipeline' | 'table' | 'today' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('pipeline');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // One-time migration for stage IDs handled in hook now

  // Onboarding tour
  // const { showTour, completeTour } = useOnboarding();
  const showTour = false;
  const completeTour = () => {};

  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [celebration, setCelebration] = useState<{ isVisible: boolean; leadName: string }>({
    isVisible: false,
    leadName: ''
  });
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue?: string;
    action: 'create_pipeline' | 'rename_pipeline' | null;
  }>({
    isOpen: false,
    title: '',
    defaultValue: '',
    action: null
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'danger'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  const { allActions, addCustomAction, deleteCustomAction, isCustomAction } = useCustomActions();
  const {
    pipelines,
    currentPipeline,
    currentPipelineId,
    loading,
    switchPipeline,
    createPipeline,
    renamePipeline,
    deletePipeline,
    updatePipelineLeads,
  } = usePipelines();

  // Get current pipeline's leads
  const leads = currentPipeline?.leads || [];

  // Create leads manager for current pipeline
  const leadsManager = createLeadsManager(leads, (newLeads, skipPersist) => {
    updatePipelineLeads(currentPipelineId, newLeads, skipPersist);
  }, currentPipelineId); // Pass pipelineId

  // Migration effect for leads (Legacy ID cleanup)
  useEffect(() => {
    if (!currentPipelineId || !leads.length) return;

    let hasChanges = false;
    const migratedLeads = leads.map(lead => {
      if (lead.stage === 'closed_won') {
        hasChanges = true;
        return { ...lead, stage: 'won' };
      }
      if (lead.stage === 'closed_lost') {
        hasChanges = true;
        return { ...lead, stage: 'lost' };
      }
      return lead;
    });

    if (hasChanges) {
      updatePipelineLeads(currentPipelineId, migratedLeads);
      // No toast to avoid spam on load, silent fix
      console.log('Fixed legacy lead stages');
    }
  }, [currentPipelineId, JSON.stringify(leads.map(l => l.stage))]); // Check whenever stages change

  // Filter leads based on search
  const filteredLeads = useMemo(() => leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lead.contactName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ), [leads, searchQuery]);

  const handleAddLead = () => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    setViewingLead(lead);
  };

  const handleDeleteLead = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le lead',
      message: 'Êtes-vous sûr de vouloir supprimer ce lead ? Cette action est irréversible.',
      onConfirm: async () => {
        await leadsManager.deleteLead(id);
        showToast('🗑️ Lead supprimé', 'success');
      }
    });
  };

  const handleSubmitLead = async (leadData: Partial<Lead>) => {
    if (editingLead) {
      // Animation removed
      await leadsManager.updateLead(editingLead.id, leadData);
      showToast('✏️ Lead mis à jour', 'success');
    } else {
      // Auto-create pipeline if none exists
      if (pipelines.length === 0) {
        const newPipelineId = crypto.randomUUID();
        const newLead = {
          ...leadData,
          pipelineId: newPipelineId, // Add pipelineId
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Lead;

        createPipeline('Pipeline Principal', [newLead], newPipelineId); // Pass the pipeline ID
        showToast('✅ Pipeline créé avec votre lead !', 'success');
      } else {
        await leadsManager.addLead(leadData as Omit<Lead, 'id' | 'created_at' | 'updated_at'>);
        showToast('✅ Lead créé !', 'success');
      }
    }
    setIsFormOpen(false);
    setEditingLead(undefined);
  };

  const handleUpdateStage = async (leadId: string, newStage: Lead['stage']) => {
    // Check if moving to won
    const lead = leads.find(l => l.id === leadId);
    const isWon = newStage === 'won' || newStage === 'closed_won';
    const wasWon = lead?.stage === 'won' || lead?.stage === 'closed_won';

    if (lead && isWon && !wasWon) {
      // Déclencher la célébration
      setCelebration({ isVisible: true, leadName: lead.name });
      showToast(`🏆 ${lead.name} est gagné !`, 'success');

      // Masquer la célébration après 3 secondes
      setTimeout(() => {
        setCelebration({ isVisible: false, leadName: '' });
      }, 3000);
    }

    // Ensure we save exactly the stage ID of the target column
    // This prevents mismatch where Lead becomes 'won' but Column is 'closed_won'
    await leadsManager.updateLead(leadId, { stage: newStage });
  };

  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    const headers = [
      'ID',
      'Nom du projet',
      'Nom du contact',
      'Poste',
      'Email',
      'Téléphone (Fixe)',
      'Téléphone (Mobile)',
      'Entreprise',
      'SIRET',
      'Adresse',
      'Code Postal',
      'Ville',
      'Pays',
      'Source',
      'Site Web',
      'LinkedIn',
      'Lien Offre',
      'Étape',
      'Valeur',
      'Notes',
      'Prochaine Action',
      'Date Action',
      'Heure Action',
      'Créé le',
    ];

    const csvContent = [
      headers.join(';'),
      ...leads.map((lead) =>
        [
          lead.id,
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${(lead.contactName || '').replace(/"/g, '""')}"`,
          `"${(lead.jobTitle || '').replace(/"/g, '""')}"`,
          `"${(lead.email || '').replace(/"/g, '""')}"`,
          `"${(lead.phone || '').replace(/"/g, '""')}"`,
          `"${(lead.mobile || '').replace(/"/g, '""')}"`,
          `"${(lead.company || '').replace(/"/g, '""')}"`,
          `"${(lead.siret || '').replace(/"/g, '""')}"`,
          `"${(lead.address || '').replace(/"/g, '""')}"`,
          `"${(lead.postalCode || '').replace(/"/g, '""')}"`,
          `"${(lead.city || '').replace(/"/g, '""')}"`,
          `"${(lead.country || '').replace(/"/g, '""')}"`,
          `"${(lead.source || '').replace(/"/g, '""')}"`,
          `"${(lead.website || '').replace(/"/g, '""')}"`,
          `"${(lead.linkedin || '').replace(/"/g, '""')}"`,
          `"${(lead.offerUrl || '').replace(/"/g, '""')}"`,
          lead.stage,
          lead.value || 0,
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
          `"${lead.nextAction || ''}"`,
          `"${lead.nextActionDate || ''}"`,
          `"${lead.nextActionTime || ''}"`,
          lead.created_at,
        ].join(';')
      ),
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `crm_export_complet_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📄 Export CSV réussi', 'success');
    }
  };

  const handleExportJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      pipelines,
      currentPipelineId,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `crm_backup_${date}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('💾 Backup JSON créé', 'success');
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const backup = JSON.parse(text);

        setConfirmModal({
          isOpen: true,
          title: 'Restaurer une sauvegarde',
          message: '⚠️ Restaurer ce backup va remplacer toutes vos données actuelles. Continuer ?',
          variant: 'warning',
          onConfirm: () => {
            localStorage.setItem('crm_pipelines', JSON.stringify(backup.pipelines));
            localStorage.setItem('crm_current_pipeline', backup.currentPipelineId);
            showToast('🔄 Backup restauré ! Rechargement...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          }
        });
      } catch {
        showToast('❌ Format JSON invalide', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportLeads = async (newLeads: Partial<Lead>[]) => {
    try {
      console.log(`[Import] Début de l'import de ${newLeads.length} leads`);

      if (pipelines.length === 0) {
        // Prepare leads for new pipeline
        const newPipelineId = crypto.randomUUID();
        const preparedLeads = newLeads.map(lead => ({
          ...lead,
          pipelineId: newPipelineId, // Add pipelineId
          name: lead.name || 'Sans nom',
          value: lead.value || 0,
          stage: lead.stage || 'new',
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as Lead[];

        console.log('[Import] Création du pipeline avec les leads');
        createPipeline('Pipeline Principal', preparedLeads, newPipelineId);
        showToast(`✅ Pipeline créé avec ${newLeads.length} leads !`, 'success');
      } else {
        console.log('[Import] Ajout des leads au pipeline existant');
        // Préparer les leads correctement au lieu de juste caster
        const leadsToAdd = newLeads.map(lead => ({
          name: lead.name || 'Sans nom',
          value: lead.value || 0,
          stage: lead.stage || 'new',
          contactName: lead.contactName,
          jobTitle: lead.jobTitle,
          company: lead.company,
          siret: lead.siret,
          email: lead.email,
          phone: lead.phone,
          mobile: lead.mobile,
          address: lead.address,
          postalCode: lead.postalCode,
          city: lead.city,
          country: lead.country,
          source: lead.source,
          website: lead.website,
          linkedin: lead.linkedin,
          offerUrl: lead.offerUrl,
          notes: lead.notes,
        }));

        const result = await leadsManager.addLeads(leadsToAdd);
        console.log('[Import] Résultat:', result);

        if (result.success) {
          showToast(`✅ ${newLeads.length} leads importés avec succès !`, 'success');
        } else {
          throw new Error('Échec de l\'ajout des leads');
        }
      }
      // Ne pas fermer le modal ici - laissons ImportWizard le gérer
      console.log('[Import] Import terminé avec succès');
    } catch (error) {
      console.error('[Import] Erreur lors de l\'import:', error);
      showToast('❌ Erreur lors de l\'import', 'error');
      // Fermer le modal en cas d'erreur
      setIsImportWizardOpen(false);
      throw error; // Propager l'erreur pour que ImportWizard sache qu'il y a eu une erreur
    }
  };

  const handleCreatePipeline = () => {
    setInputModal({
      isOpen: true,
      title: 'Nouveau Pipeline',
      defaultValue: '',
      action: 'create_pipeline'
    });
  };

  const handleRenamePipeline = () => {
    if (!currentPipeline) return;
    setInputModal({
      isOpen: true,
      title: 'Renommer le pipeline',
      defaultValue: currentPipeline.name,
      action: 'rename_pipeline'
    });
  };

  const handleInputModalConfirm = (value: string) => {
    if (!value.trim()) return;

    if (inputModal.action === 'create_pipeline') {
      createPipeline(value.trim());
      showToast(`📁 Pipeline "${value}" créé`, 'success');
    } else if (inputModal.action === 'rename_pipeline') {
      renamePipeline(currentPipelineId, value.trim());
      showToast('✏️ Pipeline renommé', 'success');
    }
  };

  const handleDeletePipeline = () => {
    if (!currentPipeline) return;

    const hasLeads = currentPipeline.leads.length > 0;
    const confirmMsg = hasLeads
      ? `⚠️ Ce pipeline contient ${currentPipeline.leads.length} lead(s). Voulez-vous vraiment le supprimer ?`
      : 'Supprimer ce pipeline ?';

    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le pipeline',
      message: confirmMsg,
      onConfirm: () => {
        try {
          deletePipeline(currentPipelineId);
          showToast('🗑️ Pipeline supprimé', 'success');
        } catch {
          showToast('❌ Impossible de supprimer le dernier pipeline', 'error');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Handle case where no pipeline exists or is selected (e.g. during deletion transition)
  if (!currentPipeline && pipelines.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Chargement du pipeline...
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pipelines={pipelines}
        currentPipelineId={currentPipelineId}
        onPipelineChange={switchPipeline}
        onCreatePipeline={handleCreatePipeline}
        onRenamePipeline={handleRenamePipeline}
        onDeletePipeline={handleDeletePipeline}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <Container isSidebarCollapsed={isSidebarCollapsed}>
        <Header
          title={
            currentView === 'dashboard'
              ? 'Dashboard'
              : currentView === 'pipeline'
                ? 'Sales Pipeline'
                : currentView === 'table'
                  ? 'Tous les Leads'
                  : currentView === 'today'
                    ? "À faire aujourd'hui"
                    : 'Settings'
          }
          subtitle={
            currentView === 'dashboard'
              ? 'Vue d\'ensemble de vos performances'
              : currentView === 'pipeline'
                ? 'Gérez vos leads à travers le processus de vente'
                : currentView === 'table'
                  ? 'Liste complète de tous vos leads'
                  : currentView === 'today'
                    ? 'Leads à traiter aujourd\'hui et en retard'
                    : 'Configuration du CRM'
          }
          leadCount={leads.length}
          onAddClick={currentView !== 'settings' ? handleAddLead : undefined}
          onExportCSVClick={currentView !== 'settings' ? handleExportCSV : undefined}
          onImportCSVClick={currentView !== 'settings' ? () => setIsImportWizardOpen(true) : undefined}
          onImportJSONClick={currentView !== 'settings' ? () => fileInputRef.current?.click() : undefined}
          onExportJSONClick={currentView !== 'settings' ? handleExportJSON : undefined}
          searchValue={searchQuery}
          onSearchChange={currentView !== 'settings' ? setSearchQuery : undefined}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJSON}
          accept=".json"
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardView leads={filteredLeads} />
            </motion.div>
          )}

          {currentView === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <PipelineView
                leads={filteredLeads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onUpdateStage={handleUpdateStage}
                onViewDetails={handleViewLead}
              />
            </motion.div>
          )}

          {currentView === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TableView
                leads={filteredLeads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onDeleteMultiple={leadsManager.deleteMultipleLeads}
                onDeleteAll={async () => {
                  await leadsManager.deleteAllLeads();
                  showToast('🗑️ Tous les leads supprimés', 'success');
                }}
                onViewDetails={handleViewLead}
              />
            </motion.div>
          )}

          {currentView === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TodayView leads={filteredLeads} onEdit={handleEditLead} />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <LeadForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLead(undefined);
        }}
        onSubmit={handleSubmitLead}
        lead={editingLead}
        allActions={allActions}
        onAddCustomAction={addCustomAction}
        onDeleteCustomAction={deleteCustomAction}
        isCustomAction={isCustomAction}
      />

      <ImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImport={handleImportLeads}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleInputModalConfirm}
        title={inputModal.title}
        defaultValue={inputModal.defaultValue}
        placeholder="Nom du pipeline..."
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}

        variant={confirmModal.variant}
      />

      <LeadDetailsModal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
      />

      <WinCelebration
        isVisible={celebration.isVisible}
        leadName={celebration.leadName}
        onComplete={() => setCelebration({ isVisible: false, leadName: '' })}
      />

      <ChatAgent />

      {/* Tour d'onboarding */}
      <OnboardingTour isOpen={showTour} onComplete={completeTour} />

    </div >
  );
}

export default App;
