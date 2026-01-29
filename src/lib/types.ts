/**
 * Core TypeScript types for CRM application
 */

/**
 * Lead stage in the sales pipeline
 */
export type LeadStage =
  | 'new'
  | 'contact'
  | 'contacted'
  | 'qualified'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'closed_won'
  | 'lost'
  | 'closed_lost';

/**
 * Next action for a lead
 */
export interface NextAction {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

/**
 * Lead (prospect/client) in the CRM
 */
export interface Lead {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  company?: string;
  siret?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  stage: LeadStage;
  value?: number;
  probability?: number;
  closedDate?: string;
  notes?: string;
  nextActions?: NextAction[];
  createdAt: string;
  updatedAt: string;
  pipelineId?: string;
}

/**
 * Stage configuration for pipeline
 */
export interface StageConfig {
  id: LeadStage;
  label: string;
  icon: string; // Lucide icon name
  color: StageColor;
}

/**
 * Color options for stages
 */
export type StageColor =
  | 'blue'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'gray'
  | 'pink'
  | 'indigo';

/**
 * Sales pipeline
 */
export interface Pipeline {
  id: string;
  name: string;
  stages: StageConfig[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Import mapping for CSV columns
 */
export interface ImportMapping {
  [csvColumn: string]: keyof Lead | null;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  leads?: Lead[];
}

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast message
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * View types in the application
 */
export type ViewType =
  | 'dashboard'
  | 'pipeline'
  | 'table'
  | 'today'
  | 'settings';

/**
 * Custom action for leads
 */
export interface CustomAction {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  handler: (lead: Lead) => void | Promise<void>;
}

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: 'fr' | 'en';
  defaultView?: ViewType;
  emailNotifications?: boolean;
  soundEffects?: boolean;
}

/**
 * Email template
 */
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  createdAt: string;
}

/**
 * Backup data structure
 */
export interface BackupData {
  version: string;
  exportedAt: string;
  pipelines: Pipeline[];
  leads: Lead[];
  settings?: UserPreferences;
}

/**
 * Statistics for dashboard
 */
export interface DashboardStats {
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  activeLeads: number;
  totalValue: number;
  wonValue: number;
  averageValue: number;
  conversionRate: number;
  leadsByStage: Record<LeadStage, number>;
  valueByStage: Record<LeadStage, number>;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}

/**
 * File export options
 */
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
  fields?: (keyof Lead)[];
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * Ice breaker question
 */
export interface IceBreakerQuestion {
  id: string;
  category: string;
  question: string;
  tip?: string;
}

/**
 * License information
 */
export interface LicenseInfo {
  type: 'free' | 'pro' | 'enterprise';
  expiresAt?: string;
  features: string[];
  maxLeads?: number;
  maxPipelines?: number;
}

/**
 * AI Chat message
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * AI Action result
 */
export interface AIActionResult {
  success: boolean;
  message: string;
  lead?: Lead;
  action?: 'create' | 'update' | 'delete';
}
