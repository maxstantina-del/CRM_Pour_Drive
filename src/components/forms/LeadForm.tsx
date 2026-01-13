import { useState, useEffect } from 'react';
import { Lead, CustomAction } from '../../lib/types';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { useNextActions } from '../../hooks/useNextActions';
import { Button, Input, Select, Modal } from '../ui';
import { ConfirmModal } from '../modals/ConfirmModal';
import { EmailComposeModal } from '../modals/EmailComposeModal';
import { Mail, Phone, Building2, DollarSign, FileText, Globe, Linkedin, Calendar, Clock, Plus, Trash2, X } from 'lucide-react';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
  lead?: Lead;
  allActions?: CustomAction[];
  onAddCustomAction?: (label: string) => CustomAction;
  onDeleteCustomAction?: (id: string) => void;
  isCustomAction?: (id: string) => boolean;
}

export function LeadForm({
  isOpen,
  onClose,
  onSubmit,
  lead,
}: LeadFormProps) {
  const { stages } = usePipelineStages();
  const { actions: nextActions, addAction: addNextAction, removeAction: removeNextAction, isDefaultAction } = useNextActions();
  const [newActionInput, setNewActionInput] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    contactName: '',
    jobTitle: '',
    email: '',
    phone: '',
    mobile: '',
    company: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    source: '',
    website: '',
    linkedin: '',
    stage: 'new', // This relies on 'new' existing, fallback later if needed
    value: 0,
    notes: '',
    nextAction: '',
    nextActionDate: '',
    nextActionTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'contact' | 'opportunity'>('contact');

  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');

  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead
      });
      if (lead.nextActionTime) {
        const [h, m] = lead.nextActionTime.split(':');
        if (h) setSelectedHour(h);
        if (m) setSelectedMinute(m);
      }
    } else {
      // Default state
      setFormData({
        name: '',
        contactName: '',
        jobTitle: '',
        email: '',
        phone: '',
        mobile: '',
        company: '',
        siret: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        source: '',
        website: '',
        linkedin: '',
        // Use first stage as default if 'new' doesn't exist
        stage: stages.length > 0 ? stages[0].id : '',
        value: 0,
        notes: '',
        nextAction: '',
        nextActionDate: new Date().toISOString().split('T')[0], // Default to today
        nextActionTime: '',
      });
      setSelectedHour('09');
      setSelectedMinute('00');
    }
    setErrors({});
  }, [lead, isOpen, stages]); // Added stages dependency

  // Sync separated time selectors to formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, nextActionTime: `${selectedHour}:${selectedMinute}` }));
  }, [selectedHour, selectedMinute]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Modifier le Lead' : 'Nouveau Lead'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'contact'
              ? 'bg-accent-blue text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('opportunity')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'opportunity'
              ? 'bg-accent-blue text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Opportunité
          </button>
        </div>

        {activeTab === 'contact' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom du projet / Lead"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                placeholder="Installation Panneaux 6kW"
              />
              <Input
                label="Nom du contact"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Jean Dupont"
              />
              <Input
                label="Poste"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Directeur Commercial"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail size={18} />}
                placeholder="jean@example.com"
              />
              <Input
                label="Téléphone (Fixe)"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={<Phone size={18} />}
                placeholder="01 23 45 67 89"
              />
              <Input
                label="Téléphone (Mobile)"
                type="tel"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                icon={<Phone size={18} />}
                placeholder="06 12 34 56 78"
              />
              <Input
                label="Entreprise"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                icon={<Building2 size={18} />}
                placeholder="Acme Inc."
              />
              <Input
                label="SIRET"
                value={formData.siret || ''}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="123 456 789 00012"
              />
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Adresse"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Rue de la Paix"
                />
                <Input
                  label="Code Postal"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75000"
                />
                <Input
                  label="Ville"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>
              <Input
                label="Pays"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="France"
              />
              <Input
                label="Source (ex: Google, LinkedIn)"
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Recommandation"
              />
              <Input
                label="Site Web"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                icon={<Globe size={18} />}
                placeholder="https://example.com"
              />
              <Input
                label="LinkedIn"
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                icon={<Linkedin size={18} />}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        )}

        {activeTab === 'opportunity' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Étape"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as Lead['stage'] })}
                options={stages.map(stage => ({
                  value: stage.id,
                  label: stage.label
                }))}
              />
              <Input
                label="Valeur (€)"
                type="number"
                value={formData.value || 0}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                icon={<DollarSign size={18} />}
                placeholder="1000"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Action à faire</label>
                {!isAddingAction ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={formData.nextAction || ''}
                        onChange={(e) => {
                          if (e.target.value === 'new_custom_action') {
                            setIsAddingAction(true);
                          } else {
                            setFormData({ ...formData, nextAction: e.target.value });
                          }
                        }}
                        className="w-full bg-[#1e293b] border border-gray-600 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionner une action...</option>
                        {nextActions.map((action) => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                        <option value="new_custom_action" className="font-semibold text-accent-blue">+ Ajouter une action</option>
                      </select>
                      {formData.nextAction && nextActions.includes(formData.nextAction) && !isDefaultAction(formData.nextAction) && (
                        <button
                          type="button"
                          onClick={() => setActionToDelete(formData.nextAction || null)}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 p-1"
                          title="Supprimer cette action de la liste"
                          aria-label="Supprimer cette action"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    {formData.nextAction === 'Email' && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (formData.email) {
                            setIsEmailModalOpen(true);
                          }
                        }}
                        disabled={!formData.email}
                        title={!formData.email ? "L'email du contact est manquant" : "Envoyer un email"}
                      >
                        <Mail size={16} />
                        <span className="hidden sm:inline">Envoyer</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      value={newActionInput}
                      onChange={(e) => setNewActionInput(e.target.value)}
                      placeholder="Nouvelle action..."
                      className="flex-1 bg-[#1e293b] border border-accent-blue rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (newActionInput.trim()) {
                            addNextAction(newActionInput);
                            setFormData({ ...formData, nextAction: newActionInput });
                            setNewActionInput('');
                            setIsAddingAction(false);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newActionInput.trim()) {
                          addNextAction(newActionInput);
                          setFormData({ ...formData, nextAction: newActionInput });
                          setNewActionInput('');
                          setIsAddingAction(false);
                        }
                      }}
                      className="p-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90"
                      aria-label="Ajouter l'action"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAction(false);
                        setNewActionInput('');
                      }}
                      className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                      aria-label="Annuler l'ajout"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <Input
                label="Date"
                type="date"
                value={formData.nextActionDate || ''}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                icon={<Calendar size={18} />}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Clock size={16} /> Heure
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="bg-[#1e293b] border border-gray-600 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none cursor-pointer hover:bg-[#2d3b4e] transition-colors"
                  >
                    <option value="00">00</option>
                    {Array.from({ length: 23 }).map((_, i) => {
                      const hour = (i + 1).toString().padStart(2, '0');
                      return <option key={hour} value={hour}>{hour}</option>;
                    })}
                  </select>
                  <span className="text-gray-400 self-center font-bold">:</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="bg-[#1e293b] border border-gray-600 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none cursor-pointer hover:bg-[#2d3b4e] transition-colors"
                  >
                    {['00', '15', '30', '45'].map(min => (
                      <option key={min} value={min}>{min}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#1e293b] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="Notes, détails, historique..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Sauvegarde...' : lead ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={actionToDelete !== null}
        onClose={() => setActionToDelete(null)}
        onConfirm={() => {
          if (actionToDelete) {
            removeNextAction(actionToDelete);
            setFormData(prev => ({ ...prev, nextAction: '' }));
          }
        }}
        title="Supprimer l'action"
        message={`Voulez-vous vraiment supprimer "${actionToDelete}" de la liste des actions disponibles ?`}
        confirmLabel="Supprimer"
        variant="danger"
      />

      <EmailComposeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={formData.email || ''}
        recipientName={formData.contactName || formData.name || ''}
      />
    </Modal>
  );
}
