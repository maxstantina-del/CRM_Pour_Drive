/**
 * Lead form for creating/editing leads.
 * Enriched with inline tag selection + creation and an optional "prochaine relance" next-action.
 */

import React, { useState, useEffect, useMemo, type FormEvent } from 'react';
import type { Lead, LeadStage } from '../../lib/types';
import { Input, Textarea, Select, Button } from '../ui';
import { DEFAULT_STAGES } from '../../hooks/usePipelineStages';
import { useTags } from '../../hooks/useTags';
import { useRecentActionLabels } from '../../hooks/useRecentActionLabels';
import { Check, Plus, X, Bell } from 'lucide-react';

export interface LeadFormExtras {
  tagIds: string[];
  nextAction?: { text: string; dueDate: string };
}

export interface LeadFormProps {
  lead?: Lead;
  onSubmit: (leadData: Partial<Lead>, extras: LeadFormExtras) => void;
  onCancel: () => void;
}

const TAG_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const { tags, getTagsForLead, createTag } = useTags();
  const { labels: recentLabels, addLabel, removeLabel, defaultLabel } = useRecentActionLabels();

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    company: '',
    siret: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    stage: 'new',
    value: 0,
    probability: 0,
    notes: '',
    ...lead,
  });

  const initialTagIds = useMemo(
    () => (lead ? getTagsForLead(lead.id).map((t) => t.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lead?.id]
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [creatingTag, setCreatingTag] = useState(false);

  const [nextActionText, setNextActionText] = useState(defaultLabel);
  const [nextActionDate, setNextActionDate] = useState('');
  const [nextActionTime, setNextActionTime] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setSelectedTagIds(getTagsForLead(lead.id).map((t) => t.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

  const handleChange = (field: keyof Lead, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreateTag = async (e: FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name || creatingTag) return;
    setCreatingTag(true);
    try {
      const created = await createTag(name, newTagColor);
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName('');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = nextActionText.trim() || 'Relancer';
    const dueDate = nextActionTime ? `${nextActionDate}T${nextActionTime}:00` : nextActionDate;
    const extras: LeadFormExtras = {
      tagIds: selectedTagIds,
      ...(nextActionDate ? { nextAction: { text: label, dueDate } } : {}),
    };
    if (nextActionDate) addLabel(label);
    onSubmit(formData, extras);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du projet"
        required
        value={formData.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nom du contact"
          value={formData.contactName || ''}
          onChange={(e) => handleChange('contactName', e.target.value)}
          fullWidth
        />
        <Input
          label="Entreprise"
          value={formData.company || ''}
          onChange={(e) => handleChange('company', e.target.value)}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          fullWidth
        />
        <Input
          label="Téléphone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          fullWidth
        />
      </div>

      <Input
        label="SIRET"
        value={formData.siret || ''}
        onChange={(e) => handleChange('siret', e.target.value)}
        helperText="14 chiffres"
        fullWidth
      />

      <Input
        label="Adresse"
        value={formData.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        fullWidth
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Ville"
          value={formData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          fullWidth
        />
        <Input
          label="Code postal"
          value={formData.zipCode || ''}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          fullWidth
        />
        <Input
          label="Pays"
          value={formData.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          fullWidth
        />
      </div>

      <Select
        label="Étape"
        value={formData.stage || 'new'}
        onChange={(e) => handleChange('stage', e.target.value as LeadStage)}
        options={DEFAULT_STAGES.map((stage) => ({
          value: stage.id,
          label: stage.label,
        }))}
        fullWidth
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valeur (€)"
          type="number"
          value={formData.value || 0}
          onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
          fullWidth
        />
        <Input
          label="Probabilité (%)"
          type="number"
          min="0"
          max="100"
          value={formData.probability || 0}
          onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
          fullWidth
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.length === 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Aucun tag — crée-en un ci-dessous.
            </span>
          )}
          {tags.map((t) => {
            const active = selectedTagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                style={
                  active
                    ? { backgroundColor: t.color, borderColor: t.color, color: 'white' }
                    : { borderColor: t.color, color: t.color }
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                  active ? 'shadow-sm' : 'bg-white dark:bg-gray-800 hover:shadow-sm'
                }`}
              >
                {active && <Check size={10} />}
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag(e);
              }
            }}
            placeholder="Créer un nouveau tag…"
            className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex gap-0.5">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTagColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border-2 ${newTagColor === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || creatingTag}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs rounded flex items-center"
            title="Créer le tag"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Prochaine relance */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Bell size={14} />
          Prochaine relance
        </label>
        <div className="grid grid-cols-[1fr_auto_auto_40px] gap-2 items-stretch">
          <input
            type="text"
            value={nextActionText}
            onChange={(e) => setNextActionText(e.target.value)}
            placeholder="Libellé (ex: Rappeler le gérant)"
            list="leadform-recent-action-labels"
            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <datalist id="leadform-recent-action-labels">
            {recentLabels.map((l) => <option key={l} value={l} />)}
          </datalist>
          <input
            type="date"
            value={nextActionDate}
            onChange={(e) => setNextActionDate(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded"
          />
          <input
            type="time"
            value={nextActionTime}
            onChange={(e) => setNextActionTime(e.target.value)}
            step={60}
            lang="fr-FR"
            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded"
            title="Heure (optionnelle, 24h)"
          />
          {nextActionDate && (
            <button
              type="button"
              onClick={() => { setNextActionDate(''); setNextActionTime(''); }}
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              title="Retirer la relance"
            >
              <X size={16} className="mx-auto" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Laisse la date vide si pas de relance prévue.
        </p>

        {recentLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center mr-1">Rapides :</span>
            {recentLabels.map((l) => (
              <span
                key={l}
                className="group inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => setNextActionText(l)}
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
            {nextActionText.trim() && !recentLabels.some((l) => l.toLowerCase() === nextActionText.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => addLabel(nextActionText)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                title="Épingler ce libellé"
              >
                <Plus size={10} /> épingler
              </button>
            )}
          </div>
        )}
      </div>

      <Textarea
        label="Notes"
        value={formData.notes || ''}
        onChange={(e) => handleChange('notes', e.target.value)}
        rows={4}
        fullWidth
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {lead ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
