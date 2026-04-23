/**
 * Fiche Autoglass service: prospect information forms attached to leads.
 * Multi-vehicle per lead → several fiches possible on the same company.
 */

import { getSupabaseClient } from '../lib/supabaseClient';

export type VehicleType = 'VL' | 'utilitaire' | 'poids_lourd';
export type DamageType = 'impact' | 'fissure' | 'bris_complet';
export type DamageLocation = 'pare_brise' | 'laterale' | 'lunette';
export type InterventionPlace = 'sur_site' | 'en_centre';
export type InsuranceGlassCovered = 'oui' | 'non' | 'inconnu';

export interface Vehicle {
  type: VehicleType | null;
  brandModel: string | null;
  plate: string | null;
}

export interface Fiche {
  id: string;
  leadId: string;
  ownerId: string;
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  /** Liste de tous les véhicules concernés par cette fiche (1..N). */
  vehicles: Vehicle[];
  /**
   * Legacy shorthands pointing at `vehicles[0]`. Kept in sync server-side by
   * the service so existing consumers (email notifications, Kanban card,
   * exports) keep rendering a useful first-vehicle summary while the rest of
   * the UI iterates `vehicles`.
   */
  vehicleType: VehicleType | null;
  vehicleBrandModel: string | null;
  vehiclePlate: string | null;
  damageType: DamageType | null;
  damageLocation: DamageLocation | null;
  immobilized: boolean | null;
  interventionAddress: string | null;
  interventionPlace: InterventionPlace | null;
  availability: string | null;
  noInsurance: boolean;
  insuranceName: string | null;
  insuranceGlassCovered: InsuranceGlassCovered | null;
  insuranceContract: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FicheInput = Partial<
  Omit<Fiche, 'id' | 'leadId' | 'ownerId' | 'createdAt' | 'updatedAt'>
>;

interface DbFicheRow {
  id: string;
  lead_id: string;
  owner_id: string;
  contact_name: string | null;
  contact_role: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  vehicles: unknown;
  vehicle_type: VehicleType | null;
  vehicle_brand_model: string | null;
  vehicle_plate: string | null;
  damage_type: DamageType | null;
  damage_location: DamageLocation | null;
  immobilized: boolean | null;
  intervention_address: string | null;
  intervention_place: InterventionPlace | null;
  availability: string | null;
  no_insurance: boolean | null;
  insurance_name: string | null;
  insurance_glass_covered: InsuranceGlassCovered | null;
  insurance_contract: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

function sanitizeVehicle(raw: unknown): Vehicle | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  const type = v.type === 'VL' || v.type === 'utilitaire' || v.type === 'poids_lourd' ? v.type : null;
  const brandModel = typeof v.brandModel === 'string' && v.brandModel ? v.brandModel : null;
  const plate = typeof v.plate === 'string' && v.plate ? v.plate : null;
  if (!type && !brandModel && !plate) return null;
  return { type, brandModel, plate };
}

function normalizeVehicles(r: DbFicheRow): Vehicle[] {
  const raw = r.vehicles;
  if (Array.isArray(raw)) {
    const list = raw.map(sanitizeVehicle).filter((v): v is Vehicle => v !== null);
    if (list.length > 0) return list;
  }
  if (r.vehicle_type || r.vehicle_brand_model || r.vehicle_plate) {
    return [{ type: r.vehicle_type, brandModel: r.vehicle_brand_model, plate: r.vehicle_plate }];
  }
  return [];
}

function rowToFiche(r: DbFicheRow): Fiche {
  const vehicles = normalizeVehicles(r);
  const first = vehicles[0] ?? { type: null, brandModel: null, plate: null };
  return {
    id: r.id,
    leadId: r.lead_id,
    ownerId: r.owner_id,
    contactName: r.contact_name,
    contactRole: r.contact_role,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    vehicles,
    vehicleType: first.type,
    vehicleBrandModel: first.brandModel,
    vehiclePlate: first.plate,
    damageType: r.damage_type,
    damageLocation: r.damage_location,
    immobilized: r.immobilized,
    interventionAddress: r.intervention_address,
    interventionPlace: r.intervention_place,
    availability: r.availability,
    noInsurance: r.no_insurance === true,
    insuranceName: r.insurance_name,
    insuranceGlassCovered: r.insurance_glass_covered,
    insuranceContract: r.insurance_contract,
    comment: r.comment,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function ficheInputToRow(input: FicheInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.contactName !== undefined) row.contact_name = input.contactName;
  if (input.contactRole !== undefined) row.contact_role = input.contactRole;
  if (input.contactPhone !== undefined) row.contact_phone = input.contactPhone;
  if (input.contactEmail !== undefined) row.contact_email = input.contactEmail;
  if (input.vehicles !== undefined) {
    const clean = (input.vehicles ?? [])
      .map(sanitizeVehicle)
      .filter((v): v is Vehicle => v !== null);
    row.vehicles = clean;
    // Mirror first vehicle onto legacy scalar columns so e-mail + Kanban cards
    // that still read vehicle_plate/brand_model/type get a sensible value.
    const first = clean[0] ?? { type: null, brandModel: null, plate: null };
    row.vehicle_type = first.type;
    row.vehicle_brand_model = first.brandModel;
    row.vehicle_plate = first.plate;
  } else {
    if (input.vehicleType !== undefined) row.vehicle_type = input.vehicleType;
    if (input.vehicleBrandModel !== undefined) row.vehicle_brand_model = input.vehicleBrandModel;
    if (input.vehiclePlate !== undefined) row.vehicle_plate = input.vehiclePlate;
  }
  if (input.damageType !== undefined) row.damage_type = input.damageType;
  if (input.damageLocation !== undefined) row.damage_location = input.damageLocation;
  if (input.immobilized !== undefined) row.immobilized = input.immobilized;
  if (input.interventionAddress !== undefined) row.intervention_address = input.interventionAddress;
  if (input.interventionPlace !== undefined) row.intervention_place = input.interventionPlace;
  if (input.availability !== undefined) row.availability = input.availability;
  if (input.noInsurance !== undefined) {
    row.no_insurance = input.noInsurance;
    // Coherence: « pas d'assurance » vide les 3 champs liés pour éviter des
    // données contradictoires en base.
    if (input.noInsurance) {
      row.insurance_name = null;
      row.insurance_glass_covered = null;
      row.insurance_contract = null;
    }
  }
  if (input.insuranceName !== undefined) row.insurance_name = input.insuranceName;
  if (input.insuranceGlassCovered !== undefined) row.insurance_glass_covered = input.insuranceGlassCovered;
  if (input.insuranceContract !== undefined) row.insurance_contract = input.insuranceContract;
  if (input.comment !== undefined) row.comment = input.comment;
  return row;
}

export async function listFichesForLead(leadId: string): Promise<Fiche[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('fiches')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToFiche(r as DbFicheRow));
}

export async function listAllFiches(): Promise<Fiche[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('fiches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToFiche(r as DbFicheRow));
}

export async function createFiche(
  leadId: string,
  ownerId: string,
  input: FicheInput
): Promise<Fiche> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('fiches')
    .insert({ lead_id: leadId, owner_id: ownerId, ...ficheInputToRow(input) })
    .select()
    .single();
  if (error) throw error;
  return rowToFiche(data as DbFicheRow);
}

export async function updateFiche(id: string, input: FicheInput): Promise<Fiche> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('fiches')
    .update(ficheInputToRow(input))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToFiche(data as DbFicheRow);
}

export async function deleteFiche(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('fiches').delete().eq('id', id);
  if (error) throw error;
}
