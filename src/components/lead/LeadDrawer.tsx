/**
 * Lead details as a right-side drawer — remplace l'ancien LeadDetailsModal.
 *
 * Organisation en 4 onglets :
 *   - Vue d'ensemble   : contact + adresse + tags + next actions + notes
 *   - Fiches Autoglass : FichesSection (multi-véhicules, RDV, fiches)
 *   - Pièces jointes   : AttachmentsSection
 *   - Journal          : ActivityTimeline
 *
 * Les tags sont remontés en petit composant compact sous l'adresse dans
 * l'onglet Vue d'ensemble. Actions principales (Modifier / Supprimer) dans
 * le footer fixe du drawer.
 */

import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Lead, NextAction } from '../../lib/types';
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Badge,
  Tooltip,
} from '../ui';
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Bell,
  Plus,
  X,
  FileText,
  Paperclip,
  Tag as TagIcon,
  Activity,
  LayoutGrid,
  Hash,
  StickyNote,
  Check,
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency } from '../../lib/utils';
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { TagPicker } from '../tags/TagPicker';
import { FichesSection } from '../fiches/FichesSection';
import { AttachmentsSection } from '../attachments/AttachmentsSection';
import { useRecentActionLabels } from '../../hooks/useRecentActionLabels';
import { cn } from '../../lib/utils';

function formatActionDue(raw: string): string {
  return raw.includes('T') ? formatDateTime(raw) : formatDate(raw);
}

export interface LeadDrawerProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onAddNextAction?: (leadId: string, text: string, dueDate: string, note?: string) => Promise<void> | void;
  onToggleNextAction?: (leadId: string, actionId: string) => Promise<void> | void;
  onDeleteNextAction?: (leadId: string, actionId: string) => Promise<void> | void;
  onUpdateNextActionNote?: (leadId: string, actionId: string, note: string) => Promise<void> | void;
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => Promise<void> | void;
}

type Tab = 'overview' | 'fiches' | 'attachments' | 'journal';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: <LayoutGrid size={14} /> },
  { id: 'fiches', label: 'Fiches Autoglass', icon: <FileText size={14} /> },
  { id: 'attachments', label: 'Pièces jointes', icon: <Paperclip size={14} /> },
  { id: 'journal', label: 'Journal', icon: <Activity size={14} /> },
];

export function LeadDrawer({
  isOpen,
  lead,
  onClose,
  onEdit,
  onDelete,
  onAddNextAction,
  onToggleNextAction,
  onDeleteNextAction,
  onUpdateNextActionNote,
  onUpdateLead,
}: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Reset to overview each time the drawer is reopened for a different lead.
  useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [isOpen, lead?.id]);

  if (!lead) return null;

  const primary = lead.company || lead.name;
  const secondary = lead.company && lead.company !== lead.name ? lead.name : null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg" ariaLabel={`Lead ${primary}`}>
      <DrawerHeader onClose={onClose}>
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <h2 className="heading-md truncate">{primary}</h2>
          <Badge tone="primary" size="sm">{lead.stage}</Badge>
        </div>
        {secondary && (
          <p className="text-[13px] text-[color:var(--color-text-muted)] truncate">{secondary}</p>
        )}
      </DrawerHeader>

      {/* Tabs */}
      <div className="shrink-0 flex items-center gap-1 px-3 border-b border-border bg-surface-muted">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium transition-colors',
                active
                  ? 'text-[color:var(--color-text)]'
                  : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]'
              )}
            >
              <span className={active ? 'text-primary' : ''}>{t.icon}</span>
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-2 right-2 bottom-0 h-[2px] bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <DrawerBody className="px-5 py-4">
        {activeTab === 'overview' && (
          <OverviewTab
            lead={lead}
            onAddNextAction={onAddNextAction}
            onToggleNextAction={onToggleNextAction}
            onDeleteNextAction={onDeleteNextAction}
            onUpdateNextActionNote={onUpdateNextActionNote}
          />
        )}
        {activeTab === 'fiches' && <FichesSection lead={lead} onSyncLead={onUpdateLead} />}
        {activeTab === 'attachments' && <AttachmentsSection leadId={lead.id} />}
        {activeTab === 'journal' && <ActivityTimeline leadId={lead.id} />}
      </DrawerBody>

      <DrawerFooter>
        <Tooltip label="Supprimer ce lead" side="top">
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              if (confirm(`Supprimer « ${lead.name} » ?`)) {
                onDelete(lead.id);
                onClose();
              }
            }}
            className="text-danger hover:bg-danger-soft"
          >
            Supprimer
          </Button>
        </Tooltip>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onClose}>
          Fermer
        </Button>
        <Button
          size="sm"
          variant="primary"
          icon={<Edit size={14} />}
          onClick={() => {
            // On laisse le drawer ouvert : le formulaire d'édition s'ouvre
            // par-dessus et, à la fermeture, on retombe naturellement sur la
            // fiche du lead.
            onEdit(lead);
          }}
        >
          Modifier
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({
  lead,
  onAddNextAction,
  onToggleNextAction,
  onDeleteNextAction,
  onUpdateNextActionNote,
}: {
  lead: Lead;
  onAddNextAction?: LeadDrawerProps['onAddNextAction'];
  onToggleNextAction?: LeadDrawerProps['onToggleNextAction'];
  onDeleteNextAction?: LeadDrawerProps['onDeleteNextAction'];
  onUpdateNextActionNote?: LeadDrawerProps['onUpdateNextActionNote'];
}) {
  const addressLine = useMemo(() => {
    const parts = [
      lead.address,
      [lead.zipCode, lead.city].filter(Boolean).join(' '),
      lead.department && `(${lead.department})`,
      lead.region,
      lead.country,
    ].filter(Boolean);
    return parts.join(' · ');
  }, [lead]);

  return (
    <div className="space-y-5">
      {/* Contact + address card */}
      <section className="surface-panel p-4 space-y-2">
        {lead.contactName && (
          <InfoLine icon={<Building size={14} />}>
            <span className="font-medium text-[color:var(--color-text)]">{lead.contactName}</span>
          </InfoLine>
        )}
        {lead.phone && (
          <InfoLine icon={<Phone size={14} />}>
            <a
              href={`tel:${lead.phone}`}
              className="text-primary hover:underline font-medium"
            >
              {lead.phone}
            </a>
          </InfoLine>
        )}
        {lead.email && (
          <InfoLine icon={<Mail size={14} />}>
            <a
              href={`mailto:${lead.email}`}
              className="text-primary hover:underline"
            >
              {lead.email}
            </a>
          </InfoLine>
        )}
        {lead.siret && (
          <InfoLine icon={<Hash size={14} />}>
            <span className="text-[color:var(--color-text-body)] font-mono text-[12px]">
              SIRET {lead.siret}
            </span>
          </InfoLine>
        )}
        {(addressLine || lead.city) && (
          <InfoLine icon={<MapPin size={14} />} alignTop>
            <span className="text-[color:var(--color-text-body)]">
              {addressLine || lead.city}
            </span>
          </InfoLine>
        )}

        {/* Tags compact sous l'adresse */}
        <div className="pt-2 border-t border-border-subtle flex items-start gap-2">
          <TagIcon
            size={13}
            className="text-[color:var(--color-text-muted)] shrink-0 mt-1"
          />
          <div className="flex-1 min-w-0">
            <TagPicker leadId={lead.id} />
          </div>
        </div>
      </section>

      {/* Valeur / Probabilité — si présents */}
      {(lead.value || lead.probability) && (
        <section className="grid grid-cols-2 gap-3">
          {lead.value ? (
            <MetricBox label="Valeur" value={formatCurrency(lead.value)} />
          ) : (
            <div />
          )}
          {lead.probability !== undefined ? (
            <MetricBox label="Probabilité" value={`${lead.probability}%`} />
          ) : (
            <div />
          )}
        </section>
      )}

      {/* Prochaine relance */}
      <section>
        <SectionLabel icon={<Bell size={13} />}>Prochaine relance / Actions à venir</SectionLabel>
        <NextActionsEditor
          lead={lead}
          onAddNextAction={onAddNextAction}
          onToggleNextAction={onToggleNextAction}
          onDeleteNextAction={onDeleteNextAction}
          onUpdateNextActionNote={onUpdateNextActionNote}
        />
      </section>

      {/* Notes */}
      {lead.notes && (
        <section>
          <SectionLabel>Notes</SectionLabel>
          <p className="text-[13px] text-[color:var(--color-text-body)] whitespace-pre-wrap surface-panel p-3">
            {lead.notes}
          </p>
        </section>
      )}

      {/* Metadata (extra columns from import) */}
      {lead.metadata && Object.keys(lead.metadata).length > 0 && (
        <section>
          <SectionLabel>Données supplémentaires</SectionLabel>
          <dl className="surface-panel p-3 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-[13px]">
            {Object.entries(lead.metadata).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt className="text-[color:var(--color-text-muted)]">{key}</dt>
                <dd className="text-[color:var(--color-text)] break-words">{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      )}

      {/* Footer dates */}
      <section className="pt-3 border-t border-border text-[11px] text-[color:var(--color-text-subtle)] flex flex-wrap gap-x-4 gap-y-1">
        <span>Créé le {formatDate(lead.createdAt)}</span>
        <span>Modifié le {formatDate(lead.updatedAt)}</span>
      </section>
    </div>
  );
}

function InfoLine({
  icon,
  children,
  alignTop,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className={cn('flex gap-2 text-[13px]', alignTop ? 'items-start' : 'items-center')}>
      <span className={cn('text-[color:var(--color-text-muted)] shrink-0', alignTop && 'mt-0.5')}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-3">
      <p className="text-caption mb-1">{label}</p>
      <p className="heading-sm">{value}</p>
    </div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="text-caption mb-2 flex items-center gap-1.5">
      {icon}
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Next actions editor — extracted from the legacy modal, styled with tokens
// ---------------------------------------------------------------------------

function NextActionsEditor({
  lead,
  onAddNextAction,
  onToggleNextAction,
  onDeleteNextAction,
  onUpdateNextActionNote,
}: {
  lead: Lead;
  onAddNextAction?: LeadDrawerProps['onAddNextAction'];
  onToggleNextAction?: LeadDrawerProps['onToggleNextAction'];
  onDeleteNextAction?: LeadDrawerProps['onDeleteNextAction'];
  onUpdateNextActionNote?: LeadDrawerProps['onUpdateNextActionNote'];
}) {
  const { labels: recentLabels, addLabel, removeLabel, defaultLabel } = useRecentActionLabels();
  const [newActionText, setNewActionText] = useState(defaultLabel);
  const [newActionDate, setNewActionDate] = useState('');
  const [newActionTime, setNewActionTime] = useState('');
  const [newActionNote, setNewActionNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabelDraft, setNewLabelDraft] = useState<string | null>(null);

  const handleAddAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!newActionDate || !onAddNextAction || adding) return;
    setAdding(true);
    try {
      const label = newActionText.trim() || 'Relancer';
      const dueDate = newActionTime ? `${newActionDate}T${newActionTime}:00` : newActionDate;
      await onAddNextAction(lead.id, label, dueDate, newActionNote.trim() || undefined);
      addLabel(label);
      setNewActionText(label);
      setNewActionDate('');
      setNewActionTime('');
      setNewActionNote('');
      setShowNoteInput(false);
    } finally {
      setAdding(false);
    }
  };

  const hasActions = lead.nextActions && lead.nextActions.length > 0;

  return (
    <div className="space-y-3">
      {hasActions && (
        <ul className="space-y-1">
          {lead.nextActions!.map((action) => (
            <ActionRow
              key={action.id}
              leadId={lead.id}
              action={action}
              onToggle={onToggleNextAction}
              onDelete={onDeleteNextAction}
              onUpdateNote={onUpdateNextActionNote}
            />
          ))}
        </ul>
      )}

      {onAddNextAction && (
        <>
          <form
            onSubmit={handleAddAction}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-1.5 items-center"
          >
            <input
              type="text"
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              placeholder="Libellé (ex: Rappeler le gérant)"
              list="recent-action-labels"
              className="h-9 px-3 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus"
            />
            <datalist id="recent-action-labels">
              {recentLabels.map((l) => <option key={l} value={l} />)}
            </datalist>
            <input
              type="date"
              value={newActionDate}
              onChange={(e) => setNewActionDate(e.target.value)}
              className="h-9 px-2 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] focus:outline-none focus:border-primary focus:shadow-focus"
              required
            />
            <input
              type="time"
              value={newActionTime}
              onChange={(e) => setNewActionTime(e.target.value)}
              step={60}
              lang="fr-FR"
              className="h-9 px-2 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] focus:outline-none focus:border-primary focus:shadow-focus"
              title="Heure (optionnelle, 24h)"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              icon={<Plus size={13} />}
              disabled={!newActionDate || adding}
              loading={adding}
            >
              Ajouter
            </Button>
          </form>

          {/* Note optionnelle — masquée par défaut, déployée au clic. */}
          {showNoteInput ? (
            <textarea
              value={newActionNote}
              onChange={(e) => setNewActionNote(e.target.value)}
              placeholder="Note (ex: le client préfère être rappelé après 18h)…"
              rows={2}
              autoFocus
              className="w-full px-3 py-2 text-[13px] rounded-md bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus resize-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="text-[11px] text-[color:var(--color-text-muted)] hover:text-primary flex items-center gap-1"
            >
              <Plus size={11} /> Ajouter une note
            </button>
          )}

          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[11px] text-[color:var(--color-text-muted)] mr-1">Rapides :</span>
            {recentLabels.map((l) => (
              <span
                key={l}
                className="group inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 text-[11px] chip chip-neutral"
              >
                <button
                  type="button"
                  onClick={() => setNewActionText(l)}
                  className="hover:text-primary"
                  title="Utiliser ce libellé"
                >
                  {l}
                </button>
                <button
                  type="button"
                  onClick={() => removeLabel(l)}
                  className="p-0.5 rounded-full opacity-40 group-hover:opacity-100 hover:bg-danger-soft hover:text-danger transition-opacity"
                  title="Retirer de la liste"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
            {newActionText.trim() && !recentLabels.some((l) => l.toLowerCase() === newActionText.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => addLabel(newActionText)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] chip chip-primary hover:opacity-80"
                title="Épingler ce libellé"
              >
                <Plus size={10} /> épingler
              </button>
            )}
            {newLabelDraft === null ? (
              <button
                type="button"
                onClick={() => setNewLabelDraft('')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border border-dashed border-border-strong text-[color:var(--color-text-muted)] rounded-full hover:border-primary hover:text-primary"
                title="Créer un nouveau libellé sans relance datée"
              >
                <Plus size={10} /> Nouveau libellé
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 text-[11px] bg-surface border border-primary rounded-full">
                <input
                  autoFocus
                  type="text"
                  value={newLabelDraft}
                  onChange={(e) => setNewLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newLabelDraft.trim()) {
                        addLabel(newLabelDraft);
                        setNewLabelDraft(null);
                      }
                    } else if (e.key === 'Escape') {
                      setNewLabelDraft(null);
                    }
                  }}
                  placeholder="Ex: Envoi rapport Q2"
                  className="bg-transparent outline-none text-[11px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] w-40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLabelDraft.trim()) {
                      addLabel(newLabelDraft);
                      setNewLabelDraft(null);
                    }
                  }}
                  disabled={!newLabelDraft.trim()}
                  className="p-0.5 rounded-full text-primary hover:bg-primary-soft disabled:opacity-30"
                  title="Ajouter"
                >
                  <Plus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setNewLabelDraft(null)}
                  className="p-0.5 rounded-full text-[color:var(--color-text-subtle)] hover:bg-surface-2"
                  title="Annuler"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </>
      )}

      {!hasActions && !onAddNextAction && (
        <p className="text-[12px] text-[color:var(--color-text-subtle)] italic">
          Aucune action prévue.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single action row with inline note editor
// ---------------------------------------------------------------------------

function ActionRow({
  leadId,
  action,
  onToggle,
  onDelete,
  onUpdateNote,
}: {
  leadId: string;
  action: NextAction;
  onToggle?: LeadDrawerProps['onToggleNextAction'];
  onDelete?: LeadDrawerProps['onDeleteNextAction'];
  onUpdateNote?: LeadDrawerProps['onUpdateNextActionNote'];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(action.note ?? '');

  useEffect(() => {
    setDraft(action.note ?? '');
  }, [action.note]);

  const canEdit = typeof onUpdateNote === 'function';

  const save = () => {
    if (!onUpdateNote) return;
    void onUpdateNote(leadId, action.id, draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(action.note ?? '');
    setEditing(false);
  };

  return (
    <li className="group rounded-sm hover:bg-surface-2 px-2 py-1">
      <div className="flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={action.completed}
          onChange={() => onToggle?.(leadId, action.id)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
        />
        <span
          className={cn(
            'flex-1 min-w-0',
            action.completed
              ? 'line-through text-[color:var(--color-text-subtle)]'
              : 'text-[color:var(--color-text)]'
          )}
        >
          {action.text}
          {action.dueDate && (
            <span className="text-[11px] text-[color:var(--color-text-muted)] ml-2">
              ({formatActionDue(action.dueDate)})
            </span>
          )}
        </span>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 text-[color:var(--color-text-subtle)] hover:text-primary transition-opacity"
            title={action.note ? 'Modifier la note' : 'Ajouter une note'}
          >
            <StickyNote size={13} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(leadId, action.id)}
            className="opacity-0 group-hover:opacity-100 text-[color:var(--color-text-subtle)] hover:text-danger transition-opacity"
            title="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Note affichée en lecture */}
      {!editing && action.note && (
        <div
          className="mt-1 ml-6 px-2 py-1 text-[12px] text-[color:var(--color-text-body)] bg-surface-2 border-l-2 border-primary/40 rounded-sm whitespace-pre-wrap cursor-pointer"
          onClick={() => canEdit && setEditing(true)}
          title={canEdit ? 'Cliquer pour modifier' : undefined}
        >
          {action.note}
        </div>
      )}

      {/* Éditeur de note */}
      {editing && (
        <div className="mt-1 ml-6 space-y-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Note (ex: rappeler après 18h, envoyer devis v2…)"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                save();
              } else if (e.key === 'Escape') {
                cancel();
              }
            }}
            className="w-full px-2 py-1.5 text-[12px] rounded-sm bg-surface border border-border text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] focus:outline-none focus:border-primary focus:shadow-focus resize-none"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-1 h-6 px-2 text-[11px] font-medium rounded-sm bg-primary text-white hover:bg-primary-hover"
            >
              <Check size={11} /> Enregistrer
            </button>
            <button
              type="button"
              onClick={cancel}
              className="h-6 px-2 text-[11px] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-surface-2 rounded-sm"
            >
              Annuler
            </button>
            {action.note && (
              <button
                type="button"
                onClick={() => {
                  if (!onUpdateNote) return;
                  void onUpdateNote(leadId, action.id, '');
                  setDraft('');
                  setEditing(false);
                }}
                className="ml-auto h-6 px-2 text-[11px] text-danger hover:bg-danger-soft rounded-sm"
              >
                Supprimer la note
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
