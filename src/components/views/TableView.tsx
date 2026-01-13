import { useState } from 'react';
import { Lead } from '../../lib/types';
import { Button, Badge } from '../ui';
import { ConfirmModal } from '../modals/ConfirmModal'; // Import ajouté
import { InputModal } from '../modals/InputModal';
import { Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface TableViewProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onDeleteAll: () => void;
  onViewDetails: (lead: Lead) => void;
}

export function TableView({
  leads,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onDeleteAll,
  onViewDetails,
}: TableViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    onConfirm: (val: string) => void;
  }>({ isOpen: false, onConfirm: () => { } });
  // Filter only active leads (exclude won/lost)
  const activeLeads = leads.filter((lead) => lead.stage !== 'won' && lead.stage !== 'lost');

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === activeLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeLeads.map((l) => l.id)));
    }
  };

  const handleDeleteSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Suppression multiple',
      message: `Supprimer ${selectedIds.size} lead(s) sélectionné(s) ?`,
      onConfirm: async () => {
        if (onDeleteMultiple) {
          await onDeleteMultiple(Array.from(selectedIds));
          setSelectedIds(new Set());
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setInputModal({
      isOpen: true,
      onConfirm: (value) => {
        if (value === 'SUPPRIMER') {
          onDeleteAll();
          setSelectedIds(new Set());
        }
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="px-8 pb-8">
      {/* Bulk Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 glass rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === activeLeads.length && activeLeads.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-accent-blue"
            />
            <span className="text-sm text-gray-300">
              {selectedIds.size > 0 ? `${selectedIds.size} sélectionné(s)` : 'Tout sélectionner'}
            </span>
          </label>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="gap-2"
          >
            <Trash2 size={14} />
            Supprimer la sélection
          </Button>

          <Button variant="secondary" size="sm" onClick={handleDeleteAll} className="gap-2 border-red-500/30 hover:bg-red-500/10 text-red-400">
            <Trash2 size={14} />
            Tout supprimer
          </Button>
        </div>

        <div className="text-sm text-gray-400">
          {activeLeads.length} lead{activeLeads.length !== 1 ? 's' : ''} actif{activeLeads.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-dark-800/50">
                <th className="px-4 py-3 text-left w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Étape
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Prochaine Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {activeLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucun lead actif
                  </td>
                </tr>
              ) : (
                activeLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedIds.has(lead.id) ? 'bg-accent-blue/10' : ''
                      }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-4 h-4 rounded accent-accent-blue"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-200">{lead.name}</div>
                      {lead.contactName && <div className="text-xs text-gray-400 mt-1">{lead.contactName}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{lead.company || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-accent-blue">
                      {formatCurrency(lead.value || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.stage}>{lead.stage}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{lead.nextAction || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatDate(lead.nextActionDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewDetails(lead)}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => onEdit(lead)}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => onDelete(lead.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      )}

      {inputModal.isOpen && (
        <InputModal
          isOpen={inputModal.isOpen}
          onClose={() => setInputModal({ ...inputModal, isOpen: false })}
          onConfirm={inputModal.onConfirm}
          title="⚠️ Suppression Totale"
          message={`Vous allez supprimer TOUS les ${activeLeads.length} leads actifs. Tapez "SUPPRIMER" pour confirmer.`}
          placeholder='Tapez "SUPPRIMER"'
          confirmLabel="Supprimer définitivement"
        />
      )}
    </div>
  );
}
