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

export interface Fiche {
  id: string;
  leadId: string;
  ownerId: string;
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  vehicleType: VehicleType | null;
  vehicleBrandModel: string | null;
  vehiclePlate: string | null;
  damageType: DamageType | null;
  damageLocation: DamageLocation | null;
  immobilized: boolean | null;
  interventionAddress: string | null;
  interventionPlace: InterventionPlace | null;
  availability: string | null;
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
  vehicle_type: VehicleType | null;
  vehicle_brand_model: string | null;
  vehicle_plate: string | null;
  damage_type: DamageType | null;
  damage_location: DamageLocation | null;
  immobilized: boolean | null;
  intervention_address: string | null;
  intervention_place: InterventionPlace | null;
  availability: string | null;
  insurance_name: string | null;
  insurance_glass_covered: InsuranceGlassCovered | null;
  insurance_contract: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

function rowToFiche(r: DbFicheRow): Fiche {
  return {
    id: r.id,
    leadId: r.lead_id,
    ownerId: r.owner_id,
    contactName: r.contact_name,
    contactRole: r.contact_role,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    vehicleType: r.vehicle_type,
    vehicleBrandModel: r.vehicle_brand_model,
    vehiclePlate: r.vehicle_plate,
    damageType: r.damage_type,
    damageLocation: r.damage_location,
    immobilized: r.immobilized,
    interventionAddress: r.intervention_address,
    interventionPlace: r.intervention_place,
    availability: r.availability,
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
  if (input.vehicleType !== undefined) row.vehicle_type = input.vehicleType;
  if (input.vehicleBrandModel !== undefined) row.vehicle_brand_model = input.vehicleBrandModel;
  if (input.vehiclePlate !== undefined) row.vehicle_plate = input.vehiclePlate;
  if (input.damageType !== undefined) row.damage_type = input.damageType;
  if (input.damageLocation !== undefined) row.damage_location = input.damageLocation;
  if (input.immobilized !== undefined) row.immobilized = input.immobilized;
  if (input.interventionAddress !== undefined) row.intervention_address = input.interventionAddress;
  if (input.interventionPlace !== undefined) row.intervention_place = input.interventionPlace;
  if (input.availability !== undefined) row.availability = input.availability;
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
