/**
 * Lead form for creating/editing leads.
 *
 * Tags et prochaine relance ne sont plus gérés dans ce formulaire — ils sont
 * disponibles dans le drawer du lead (TagPicker + NextActionsEditor). Le
 * formulaire reste focus sur les champs structurels du lead.
 */

import React, { useState, useEffect } from 'react';
import type { Lead, LeadStage } from '../../lib/types';
import { Input, Textarea, Select, Button } from '../ui';
import { DEFAULT_STAGES } from '../../hooks/usePipelineStages';
import { formatFrenchPhone } from '../../lib/phone';

export interface LeadFormExtras {
  /** Conservé pour compat App.tsx — toujours vide depuis cette version. */
  tagIds: string[];
  /** Conservé pour compat App.tsx — jamais défini depuis cette version. */
  nextAction?: { text: string; dueDate: string };
}

export interface LeadFormProps {
  lead?: Lead;
  onSubmit: (leadData: Partial<Lead>, extras: LeadFormExtras) => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<Lead>>(() => {
    const base: Partial<Lead> = {
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
    };
    if (base.phone) base.phone = formatFrenchPhone(base.phone);
    return base;
  });

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead, phone: lead.phone ? formatFrenchPhone(lead.phone) : '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

  const handleChange = (field: keyof Lead, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, { tagIds: [] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom de l'entreprise"
        required
        value={formData.company || formData.name || ''}
        onChange={(e) => {
          // On garde `name` et `company` synchronisés : la carte affiche
          // company en priorité, et name sert d'identifiant obligatoire.
          const v = e.target.value;
          setFormData((prev) => ({ ...prev, company: v, name: v }));
        }}
        placeholder="Ex : Transports Chatel"
        fullWidth
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nom du contact"
          value={formData.contactName || ''}
          onChange={(e) => handleChange('contactName', e.target.value)}
          placeholder="Ex : Jean Dupont"
          fullWidth
        />
        <Input
          label="SIRET"
          value={formData.siret || ''}
          onChange={(e) => handleChange('siret', e.target.value)}
          helperText="14 chiffres"
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
          onChange={(e) => handleChange('phone', formatFrenchPhone(e.target.value))}
          placeholder="04 50 00 00 00"
          autoComplete="tel"
          inputMode="tel"
          fullWidth
        />
      </div>

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
