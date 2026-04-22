import React, { useState, type FormEvent, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '../ui';
import { Save, Loader2, User, Truck, AlertTriangle, MapPin, Calendar, Shield, MessageCircle, Zap, Sparkles, Plus, Trash2 } from 'lucide-react';
import type {
  Fiche,
  FicheInput,
  VehicleType,
  DamageType,
  DamageLocation,
  InterventionPlace,
  InsuranceGlassCovered,
} from '../../services/fichesService';
import type { Lead } from '../../lib/types';

export interface FicheFormModalProps {
  isOpen: boolean;
  initial?: Fiche | null;
  lead?: Lead;
  onClose: () => void;
  onSubmit: (input: FicheInput) => Promise<void>;
}

interface AppointmentSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM 24h
  note: string; // optional (ex: 'Inspection', 'Remplacement')
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
  appointments: AppointmentSlot[];
  insuranceName: string;
  insuranceGlassCovered: InsuranceGlassCovered | '';
  insuranceContract: string;
  comment: string;
};

const emptySlot: AppointmentSlot = { date: '', time: '', note: '' };

/**
 * French license plate (SIV format since 2009): 2 letters - 3 digits - 2 letters.
 * Strips separators, uppercases, then inserts dashes at positions 2 and 5 as
 * the user types. Handles partial input (e.g., "AB", "AB-1", "AB-12", "AB-123-C").
 */
function formatLicensePlate(raw: string): string {
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
}

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
  appointments: [{ ...emptySlot }],
  insuranceName: '',
  insuranceGlassCovered: '',
  insuranceContract: '',
  comment: '',
};

/**
 * Availability is stored as a single TEXT column. Multiple appointments are
 * serialized as ';;'-separated entries, each entry being
 * 'YYYY-MM-DD HH:MM | note'. Parsing is lenient so legacy free-text or
 * single-slot storage still loads without losing data.
 */
function parseSlot(raw: string): AppointmentSlot {
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?(?:\s*\|\s*(.*))?$/);
  if (m) {
    return { date: m[1] ?? '', time: m[2] ?? '', note: (m[3] ?? '').trim() };
  }
  return { date: '', time: '', note: raw };
}

function parseAppointments(raw: string | null): AppointmentSlot[] {
  if (!raw) return [{ ...emptySlot }];
  const entries = raw.split(';;').map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) return [{ ...emptySlot }];
  return entries.map(parseSlot);
}

function formatSlot(s: AppointmentSlot): string {
  const parts: string[] = [];
  if (s.date) parts.push(s.time ? `${s.date} ${s.time}` : s.date);
  if (s.note.trim()) parts.push(s.note.trim());
  return parts.join(' | ');
}

function formatAppointments(slots: AppointmentSlot[]): string | null {
  const serialized = slots.map(formatSlot).filter(Boolean);
  return serialized.length ? serialized.join(';;') : null;
}

/**
 * Pre-fill a blank fiche with data already known on the lead card so the
 * commercial doesn't re-type contact name, phone, email, and intervention
 * address during a phone call.
 */
function leadToDefaults(lead: Lead | undefined): FormState {
  if (!lead) return emptyForm;
  const addressParts = [lead.address, lead.zipCode && lead.city ? `${lead.zipCode} ${lead.city}` : lead.zipCode || lead.city]
    .filter(Boolean)
    .join(', ');
  return {
    ...emptyForm,
    contactName: lead.contactName || lead.name || '',
    contactPhone: lead.phone || '',
    contactEmail: lead.email || '',
    interventionAddress: addressParts,
  };
}

function ficheToForm(f: Fiche | null | undefined, lead?: Lead): FormState {
  if (!f) return leadToDefaults(lead);
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
    appointments: parseAppointments(f.availability),
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
    availability: formatAppointments(s.appointments),
    insuranceName: s.insuranceName || null,
    insuranceGlassCovered: (s.insuranceGlassCovered || null) as InsuranceGlassCovered | null,
    insuranceContract: s.insuranceContract || null,
    comment: s.comment || null,
  };
}

const PHRASE_CLE =
  "Parfait, je vous pose juste quelques questions, ça me permet de lancer l'intervention et vous n'avez rien à gérer derrière.";

export function FicheFormModal({ isOpen, initial, lead, onClose, onSubmit }: FicheFormModalProps) {
  const [form, setForm] = useState<FormState>(() => ficheToForm(initial, lead));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const isNew = !initial;
  const prefilled = isNew && !!(lead && (lead.contactName || lead.phone || lead.email || lead.address));

  useEffect(() => {
    if (isOpen) setForm(ficheToForm(initial, lead));
  }, [isOpen, initial, lead]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const updateSlot = (index: number, patch: Partial<AppointmentSlot>) =>
    setForm((prev) => ({
      ...prev,
      appointments: prev.appointments.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const addSlot = () =>
    setForm((prev) => ({ ...prev, appointments: [...prev.appointments, { ...emptySlot }] }));

  const removeSlot = (index: number) =>
    setForm((prev) => ({
      ...prev,
      appointments: prev.appointments.length > 1
        ? prev.appointments.filter((_, i) => i !== index)
        : [{ ...emptySlot }],
    }));

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
        {prefilled && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
            <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              Champs contact et adresse pré-remplis depuis la fiche prospect.
              Tu peux les modifier si la personne à l'adresse d'intervention est différente.
            </span>
          </div>
        )}

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
                onChange={(e) => update('vehiclePlate', formatLicensePlate(e.target.value))}
                className={`${inputCls} font-mono uppercase tracking-wider`}
                placeholder="AB-123-CD"
                maxLength={9}
                autoComplete="off"
                inputMode="text"
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

        <Section icon={<Calendar size={14} />} title="Rendez-vous">
          <div className="space-y-3">
            {form.appointments.map((slot, i) => {
              const today = new Date().toISOString().slice(0, 10);
              const minDate = slot.date && slot.date < today ? slot.date : today;
              return (
                <div
                  key={i}
                  className="rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-950/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Rendez-vous {i + 1}
                    </span>
                    {form.appointments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Supprimer ce créneau"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <Row>
                    <Field label="Date">
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => updateSlot(i, { date: e.target.value })}
                        className={inputCls}
                        min={minDate}
                      />
                    </Field>
                    <Field label="Heure (24h)">
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateSlot(i, { time: e.target.value })}
                        className={inputCls}
                        step={900}
                      />
                    </Field>
                  </Row>
                  <Field label="Objet (optionnel)">
                    <input
                      type="text"
                      value={slot.note}
                      onChange={(e) => updateSlot(i, { note: e.target.value })}
                      className={inputCls}
                      placeholder="ex: Inspection, Remplacement, Vitre latérale droite…"
                    />
                  </Field>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addSlot}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Plus size={14} />
              Ajouter un autre rendez-vous
            </button>
          </div>
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
