/**
 * Lead details modal
 */

import React from 'react';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button, Badge } from '../ui';
import { Edit, Trash2, Mail, Phone, Building, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatCurrency } from '../../lib/utils';

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
            <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
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
                <Building size={16} className="text-gray-400" />
                <span>{lead.contactName}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-gray-400" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-400" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
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
                <Building size={16} className="text-gray-400" />
                <span>{lead.company}</span>
                {lead.siret && <span className="text-gray-500">• SIRET: {lead.siret}</span>}
              </div>
            )}
            {lead.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <span>
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
                <span className="text-gray-500">Valeur: </span>
                <span className="font-semibold">{formatCurrency(lead.value)}</span>
              </div>
            )}
            {lead.probability !== undefined && (
              <div>
                <span className="text-gray-500">Probabilité: </span>
                <span className="font-semibold">{lead.probability}%</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Next Actions */}
        {lead.nextActions && lead.nextActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Actions à venir</h4>
            <ul className="space-y-1">
              {lead.nextActions.map(action => (
                <li key={action.id} className="text-sm">
                  <span className={action.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                    • {action.text}
                  </span>
                  {action.dueDate && (
                    <span className="text-gray-500 ml-2">({formatDate(action.dueDate)})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 pt-4 border-t">
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
