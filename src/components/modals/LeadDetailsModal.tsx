/**
 * Lead details modal
 */

import React, { useState, type FormEvent } from 'react';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button, Badge } from '../ui';
import { Edit, Trash2, Mail, Phone, Building, MapPin, Bell, Plus, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatDateTime, formatCurrency } from '../../lib/utils';

/** Show date + time if the dueDate string carries a time, else just the date. */
function formatActionDue(raw: string): string {
  return raw.includes('T') ? formatDateTime(raw) : formatDate(raw);
}
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { TagPicker } from '../tags/TagPicker';
import { FichesSection } from '../fiches/FichesSection';
import { useRecentActionLabels } from '../../hooks/useRecentActionLabels';

export interface LeadDetailsModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAddNextAction?: (leadId: string, text: string, dueDate: string) => Promise<void> | void;
  onToggleNextAction?: (leadId: string, actionId: string) => Promise<void> | void;
  onDeleteNextAction?: (leadId: string, actionId: string) => Promise<void> | void;
}

export function LeadDetailsModal({
  isOpen,
  lead,
  onClose,
  onEdit,
  onDelete,
  onAddNextAction,
  onToggleNextAction,
  onDeleteNextAction,
}: LeadDetailsModalProps) {
  const { labels: recentLabels, addLabel, removeLabel, defaultLabel } = useRecentActionLabels();
  const [newActionText, setNewActionText] = useState(defaultLabel);
  const [newActionDate, setNewActionDate] = useState('');
  const [newActionTime, setNewActionTime] = useState('');
  const [adding, setAdding] = useState(false);

  if (!lead) return null;

  const handleAddAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!newActionDate || !onAddNextAction || adding) return;
    setAdding(true);
    try {
      const label = newActionText.trim() || 'Relancer';
      const dueDate = newActionTime
        ? `${newActionDate}T${newActionTime}:00`
        : newActionDate;
      await onAddNextAction(lead.id, label, dueDate);
      addLabel(label);
      setNewActionText(label);
      setNewActionDate('');
      setNewActionTime('');
    } finally {
      setAdding(false);
    }
  };

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${lead.contactName || lead.name}
ORG:${lead.company || ''}
TEL:${lead.phone || ''}
EMAIL:${lead.email || ''}
ADR:;;${lead.address || ''};${lead.city || ''};${lead.zipCode || ''};${lead.country || ''}
END:VCARD`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du Lead" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{lead.name}</h3>
            <Badge variant="blue" size="sm" className="mt-2">
              {lead.stage}
            </Badge>
          </div>
          <QRCodeSVG value={vCardData} size={100} />
        </div>

        {/* Contact Info */}
        {(lead.contactName || lead.email || lead.phone) && (
          <div className="space-y-2">
            {lead.contactName && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{lead.contactName}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-gray-500" />
                <a href={`mailto:${lead.email}`} className="text-blue-700 hover:text-blue-800 hover:underline font-medium">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-500" />
                <a href={`tel:${lead.phone}`} className="text-blue-700 hover:text-blue-800 hover:underline font-medium">
                  {lead.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Company & Address */}
        {(lead.company || lead.address) && (
          <div className="space-y-2">
            {lead.company && lead.company !== lead.name && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{lead.company}</span>
                {lead.siret && <span className="text-gray-600 dark:text-gray-300">• SIRET: {lead.siret}</span>}
              </div>
            )}
            {lead.siret && lead.company === lead.name && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">SIRET: {lead.siret}</span>
              </div>
            )}
            {lead.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-gray-500 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-100">
                  {lead.address}
                  {lead.city && `, ${lead.city}`}
                  {lead.zipCode && ` ${lead.zipCode}`}
                  {lead.country && `, ${lead.country}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Value & Probability */}
        {(lead.value || lead.probability) && (
          <div className="flex gap-4 text-sm">
            {lead.value && (
              <div>
                <span className="text-gray-600 dark:text-gray-300">Valeur : </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(lead.value)}</span>
              </div>
            )}
            {lead.probability !== undefined && (
              <div>
                <span className="text-gray-600 dark:text-gray-300">Probabilité : </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{lead.probability}%</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Next Actions */}
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            <Bell size={14} />
            Prochaine relance / Actions à venir
          </h4>

          {lead.nextActions && lead.nextActions.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {lead.nextActions.map(action => (
                <li key={action.id} className="flex items-center gap-2 text-sm group">
                  <input
                    type="checkbox"
                    checked={action.completed}
                    onChange={() => onToggleNextAction?.(lead.id, action.id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={action.completed ? 'line-through text-gray-500 dark:text-gray-400 flex-1' : 'text-gray-900 dark:text-gray-100 flex-1'}>
                    {action.text}
                    {action.dueDate && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2 text-xs">
                        ({formatActionDue(action.dueDate)})
                      </span>
                    )}
                  </span>
                  {onDeleteNextAction && (
                    <button
                      onClick={() => onDeleteNextAction(lead.id, action.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {onAddNextAction && (
            <form onSubmit={handleAddAction} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Libellé (ex: Rappeler le gérant)"
                list="recent-action-labels"
                className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <datalist id="recent-action-labels">
                {recentLabels.map((l) => <option key={l} value={l} />)}
              </datalist>
              <input
                type="date"
                value={newActionDate}
                onChange={(e) => setNewActionDate(e.target.value)}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded"
                required
              />
              <input
                type="time"
                value={newActionTime}
                onChange={(e) => setNewActionTime(e.target.value)}
                step={60}
                lang="fr-FR"
                className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded"
                title="Heure (optionnelle, 24h)"
              />
              <button
                type="submit"
                disabled={!newActionDate || adding}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm rounded flex items-center gap-1"
                title="Ajouter la relance"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </form>
          )}

          {onAddNextAction && recentLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center mr-1">Rapides :</span>
              {recentLabels.map((l) => (
                <span
                  key={l}
                  className="group inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700"
                >
                  <button
                    type="button"
                    onClick={() => setNewActionText(l)}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                    title="Utiliser ce libellé"
                  >
                    {l}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLabel(l)}
                    className="p-0.5 rounded-full opacity-40 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                    title="Retirer de la liste"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {newActionText.trim() && !recentLabels.some((l) => l.toLowerCase() === newActionText.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => addLabel(newActionText)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  title="Épingler ce libellé"
                >
                  <Plus size={10} /> épingler
                </button>
              )}
            </div>
          )}

          {(!lead.nextActions || lead.nextActions.length === 0) && !onAddNextAction && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Aucune action prévue.</p>
          )}
        </div>

        {/* Tags */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tags</h4>
          <TagPicker leadId={lead.id} />
        </div>

        {/* Fiches Autoglass */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <FichesSection leadId={lead.id} leadName={lead.name} leadCompany={lead.company} />
        </div>

        {/* Activity Timeline */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <ActivityTimeline leadId={lead.id} />
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p>Créé le {formatDate(lead.createdAt)}</p>
          <p>Modifié le {formatDate(lead.updatedAt)}</p>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="danger"
          icon={<Trash2 size={16} />}
          onClick={() => {
            onDelete(lead.id);
            onClose();
          }}
        >
          Supprimer
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
        <Button
          variant="primary"
          icon={<Edit size={16} />}
          onClick={() => {
            onEdit(lead);
            onClose();
          }}
        >
          Modifier
        </Button>
      </ModalFooter>
    </Modal>
  );
}
