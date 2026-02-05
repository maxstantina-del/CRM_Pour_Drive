/**
 * Lead form for creating/editing leads
 */

import React, { useState, useEffect } from 'react';
import type { Lead, LeadStage } from '../../lib/types';
import { Input, Textarea, Select, Button } from '../ui';
import { DEFAULT_STAGES } from '../../hooks/usePipelineStages';

export interface LeadFormProps {
  lead?: Lead;
  onSubmit: (leadData: Partial<Lead>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading = false }: LeadFormProps) {
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
    ...lead
  });

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  const handleChange = (field: keyof Lead, value: Lead[keyof Lead]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du projet"
        required
        value={formData.name || ''}
        onChange={e => handleChange('name', e.target.value)}
        fullWidth
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nom du contact"
          value={formData.contactName || ''}
          onChange={e => handleChange('contactName', e.target.value)}
          fullWidth
        />
        <Input
          label="Entreprise"
          value={formData.company || ''}
          onChange={e => handleChange('company', e.target.value)}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={e => handleChange('email', e.target.value)}
          fullWidth
        />
        <Input
          label="Téléphone"
          type="tel"
          value={formData.phone || ''}
          onChange={e => handleChange('phone', e.target.value)}
          fullWidth
        />
      </div>

      <Input
        label="SIRET"
        value={formData.siret || ''}
        onChange={e => handleChange('siret', e.target.value)}
        helperText="14 chiffres"
        fullWidth
      />

      <Input
        label="Adresse"
        value={formData.address || ''}
        onChange={e => handleChange('address', e.target.value)}
        fullWidth
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Ville"
          value={formData.city || ''}
          onChange={e => handleChange('city', e.target.value)}
          fullWidth
        />
        <Input
          label="Code postal"
          value={formData.zipCode || ''}
          onChange={e => handleChange('zipCode', e.target.value)}
          fullWidth
        />
        <Input
          label="Pays"
          value={formData.country || ''}
          onChange={e => handleChange('country', e.target.value)}
          fullWidth
        />
      </div>

      <Select
        label="Étape"
        value={formData.stage || 'new'}
        onChange={e => handleChange('stage', e.target.value as LeadStage)}
        options={DEFAULT_STAGES.map(stage => ({
          value: stage.id,
          label: stage.label
        }))}
        fullWidth
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valeur (€)"
          type="number"
          value={formData.value || 0}
          onChange={e => handleChange('value', parseFloat(e.target.value) || 0)}
          fullWidth
        />
        <Input
          label="Probabilité (%)"
          type="number"
          min="0"
          max="100"
          value={formData.probability || 0}
          onChange={e => handleChange('probability', parseInt(e.target.value) || 0)}
          fullWidth
        />
      </div>

      <Textarea
        label="Notes"
        value={formData.notes || ''}
        onChange={e => handleChange('notes', e.target.value)}
        rows={4}
        fullWidth
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {lead ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
