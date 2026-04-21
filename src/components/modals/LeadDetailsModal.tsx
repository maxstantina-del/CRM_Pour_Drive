/**
 * Lead details modal
 */

import React from 'react';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button, Badge } from '../ui';
import { Edit, Trash2, Mail, Phone, Building, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { TagPicker } from '../tags/TagPicker';

export interface LeadDetailsModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

export function LeadDetailsModal({ isOpen, lead, onClose, onEdit, onDelete }: LeadDetailsModalProps) {
  if (!lead) return null;

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
            {lead.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={16} className="text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{lead.company}</span>
                {lead.siret && <span className="text-gray-600 dark:text-gray-300">• SIRET: {lead.siret}</span>}
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
        {lead.nextActions && lead.nextActions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Actions à venir</h4>
            <ul className="space-y-1">
              {lead.nextActions.map(action => (
                <li key={action.id} className="text-sm">
                  <span className={action.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                    • {action.text}
                  </span>
                  {action.dueDate && (
                    <span className="text-gray-600 dark:text-gray-400 ml-2">({formatDate(action.dueDate)})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tags</h4>
          <TagPicker leadId={lead.id} />
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
