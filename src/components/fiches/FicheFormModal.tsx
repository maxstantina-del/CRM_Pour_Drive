import React, { useState, type FormEvent, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '../ui';
import { Save, Loader2, User, Truck, AlertTriangle, MapPin, Calendar, Shield, MessageCircle, Zap } from 'lucide-react';
import type {
  Fiche,
  FicheInput,
  VehicleType,
  DamageType,
  DamageLocation,
  InterventionPlace,
  InsuranceGlassCovered,
} from '../../services/fichesService';

export interface FicheFormModalProps {
  isOpen: boolean;
  initial?: Fiche | null;
  onClose: () => void;
  onSubmit: (input: FicheInput) => Promise<void>;
}

type FormState = {
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  vehicleType: VehicleType | '';
  vehicleBrandModel: string;
  vehiclePlate: string;
  damageType: DamageType | '';
  damageLocation: DamageLocation | '';
  immobilized: 'oui' | 'non' | '';
  interventionAddress: string;
  interventionPlace: InterventionPlace | '';
  availability: string;
  insuranceName: string;
  insuranceGlassCovered: InsuranceGlassCovered | '';
  insuranceContract: string;
  comment: string;
};

const emptyForm: FormState = {
  contactName: '',
  contactRole: '',
  contactPhone: '',
  contactEmail: '',
  vehicleType: '',
  vehicleBrandModel: '',
  vehiclePlate: '',
  damageType: '',
  damageLocation: '',
  immobilized: '',
  interventionAddress: '',
  interventionPlace: '',
  availability: '',
  insuranceName: '',
  insuranceGlassCovered: '',
  insuranceContract: '',
  comment: '',
};

function ficheToForm(f: Fiche | null | undefined): FormState {
  if (!f) return emptyForm;
  return {
    contactName: f.contactName ?? '',
    contactRole: f.contactRole ?? '',
    contactPhone: f.contactPhone ?? '',
    contactEmail: f.contactEmail ?? '',
    vehicleType: f.vehicleType ?? '',
    vehicleBrandModel: f.vehicleBrandModel ?? '',
    vehiclePlate: f.vehiclePlate ?? '',
    damageType: f.damageType ?? '',
    damageLocation: f.damageLocation ?? '',
    immobilized: f.immobilized === true ? 'oui' : f.immobilized === false ? 'non' : '',
    interventionAddress: f.interventionAddress ?? '',
    interventionPlace: f.interventionPlace ?? '',
    availability: f.availability ?? '',
    insuranceName: f.insuranceName ?? '',
    insuranceGlassCovered: f.insuranceGlassCovered ?? '',
    insuranceContract: f.insuranceContract ?? '',
    comment: f.comment ?? '',
  };
}

function formToInput(s: FormState): FicheInput {
  return {
    contactName: s.contactName || null,
    contactRole: s.contactRole || null,
    contactPhone: s.contactPhone || null,
    contactEmail: s.contactEmail || null,
    vehicleType: (s.vehicleType || null) as VehicleType | null,
    vehicleBrandModel: s.vehicleBrandModel || null,
    vehiclePlate: s.vehiclePlate || null,
    damageType: (s.damageType || null) as DamageType | null,
    damageLocation: (s.damageLocation || null) as DamageLocation | null,
    immobilized: s.immobilized === 'oui' ? true : s.immobilized === 'non' ? false : null,
    interventionAddress: s.interventionAddress || null,
    interventionPlace: (s.interventionPlace || null) as InterventionPlace | null,
    availability: s.availability || null,
    insuranceName: s.insuranceName || null,
    insuranceGlassCovered: (s.insuranceGlassCovered || null) as InsuranceGlassCovered | null,
    insuranceContract: s.insuranceContract || null,
    comment: s.comment || null,
  };
}

const PHRASE_CLE =
  "Parfait, je vous pose juste quelques questions, ça me permet de lancer l'intervention et vous n'avez rien à gérer derrière.";

export function FicheFormModal({ isOpen, initial, onClose, onSubmit }: FicheFormModalProps) {
  const [form, setForm] = useState<FormState>(() => ficheToForm(initial));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(ficheToForm(initial));
  }, [isOpen, initial]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const copyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(PHRASE_CLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(formToInput(form));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Modifier la fiche Autoglass' : 'Nouvelle fiche Autoglass'}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-5">
        <button
          type="button"
          onClick={copyPhrase}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700 text-sm text-orange-800 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-left"
        >
          <Zap size={16} />
          <span className="flex-1">
            <span className="font-medium">Phrase d'intro :</span> « {PHRASE_CLE} »
          </span>
          <span className="text-xs text-orange-600 dark:text-orange-300">
            {copied ? '✓ copiée' : 'copier'}
          </span>
        </button>

        <Section icon={<User size={14} />} title="Contact intervention">
          <Row>
            <Field label="Nom + prénom">
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Fonction (gérant, flotte…)">
              <input
                type="text"
                value={form.contactRole}
                onChange={(e) => update('contactRole', e.target.value)}
                className={inputCls}
              />
            </Field>
          </Row>
          <Row>
            <Field label="Téléphone direct">
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                className={inputCls}
              />
            </Field>
          </Row>
        </Section>

        <Section icon={<Truck size={14} />} title="Véhicule">
          <Row>
            <Field label="Type">
              <select
                value={form.vehicleType}
                onChange={(e) => update('vehicleType', e.target.value as VehicleType | '')}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="VL">VL (voiture légère)</option>
                <option value="utilitaire">Utilitaire</option>
                <option value="poids_lourd">Poids lourd</option>
              </select>
            </Field>
            <Field label="Immatriculation">
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={(e) => update('vehiclePlate', e.target.value.toUpperCase())}
                className={inputCls}
                placeholder="AB-123-CD"
              />
            </Field>
          </Row>
          <Field label="Marque + modèle">
            <input
              type="text"
              value={form.vehicleBrandModel}
              onChange={(e) => update('vehicleBrandModel', e.target.value)}
              className={inputCls}
              placeholder="Renault Master, Peugeot 208…"
            />
          </Field>
        </Section>

        <Section icon={<AlertTriangle size={14} />} title="Sinistre & urgence">
          <Row>
            <Field label="Type de dommage">
              <select
                value={form.damageType}
                onChange={(e) => update('damageType', e.target.value as DamageType | '')}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="impact">Impact</option>
                <option value="fissure">Fissure</option>
                <option value="bris_complet">Bris complet</option>
              </select>
            </Field>
            <Field label="Localisation">
              <select
                value={form.damageLocation}
                onChange={(e) => update('damageLocation', e.target.value as DamageLocation | '')}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="pare_brise">Pare-brise</option>
                <option value="laterale">Vitre latérale</option>
                <option value="lunette">Lunette arrière</option>
              </select>
            </Field>
          </Row>
          <Field label="Véhicule immobilisé ?">
            <div className="flex gap-4 pt-1">
              {(['oui', 'non'] as const).map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="immobilized"
                    checked={form.immobilized === v}
                    onChange={() => update('immobilized', v)}
                  />
                  <span className="capitalize">{v}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        <Section icon={<MapPin size={14} />} title="Intervention">
          <Field label="Adresse d'intervention">
            <input
              type="text"
              value={form.interventionAddress}
              onChange={(e) => update('interventionAddress', e.target.value)}
              className={inputCls}
              placeholder="Rue, code postal, ville"
            />
          </Field>
          <Field label="Intervention souhaitée">
            <div className="flex gap-4 pt-1">
              {(['sur_site', 'en_centre'] as const).map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="place"
                    checked={form.interventionPlace === v}
                    onChange={() => update('interventionPlace', v)}
                  />
                  <span>{v === 'sur_site' ? 'Sur site' : 'En centre Autoglass'}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        <Section icon={<Calendar size={14} />} title="Disponibilité">
          <Field label="Créneaux disponibles">
            <textarea
              value={form.availability}
              onChange={(e) => update('availability', e.target.value)}
              className={`${inputCls} min-h-[60px]`}
              placeholder="Lundi 8h-12h, mardi après-midi…"
            />
          </Field>
        </Section>

        <Section icon={<Shield size={14} />} title="Assurance">
          <Row>
            <Field label="Nom de l'assurance">
              <input
                type="text"
                value={form.insuranceName}
                onChange={(e) => update('insuranceName', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Bris de glace inclus ?">
              <select
                value={form.insuranceGlassCovered}
                onChange={(e) =>
                  update('insuranceGlassCovered', e.target.value as InsuranceGlassCovered | '')
                }
                className={inputCls}
              >
                <option value="">—</option>
                <option value="oui">Oui</option>
                <option value="non">Non</option>
                <option value="inconnu">Ne sait pas</option>
              </select>
            </Field>
          </Row>
          <Field label="Numéro de contrat (si dispo)">
            <input
              type="text"
              value={form.insuranceContract}
              onChange={(e) => update('insuranceContract', e.target.value)}
              className={inputCls}
            />
          </Field>
        </Section>

        <Section icon={<MessageCircle size={14} />} title="Commentaire">
          <Field label="Infos complémentaires (flotte, urgence, contraintes…)">
            <textarea
              value={form.comment}
              onChange={(e) => update('comment', e.target.value)}
              className={`${inputCls} min-h-[80px]`}
            />
          </Field>
        </Section>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            disabled={saving}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder la fiche'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
