export type Stage = string;

export type Lead = {
  id: string;
  pipelineId: string; // Pipeline this lead belongs to
  name: string;
  contactName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  mobile?: string; // Added mobile specifically
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siret?: string; // French business ID
  source?: string;
  website?: string;
  linkedin?: string;
  offerUrl?: string; // URL de l'offre d'emploi
  stage: Stage;
  value: number;
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  nextActionTime?: string;
  created_at: string;
  updated_at: string;
};

export type Pipeline = {
  id: string;
  name: string;
  createdAt: string;
  leads: Lead[];
  customStages?: Record<string, string>; // stage id -> custom name
  customStagesOrder?: string[]; // Order of stages
};

export type CustomAction = {
  id: string;
  label: string;
};

export type StageConfig = {
  id: Stage;
  label: string;
  icon: string;
  emoji?: string;
  color: string;
  isClosedStage?: boolean;
};

export type UserProfile = {
  name: string;
  email: string;
  company: string;
  role?: string;
  sector?: string;
  avatar?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'pending';
  joinedAt: string;
};
