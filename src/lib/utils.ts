/**
 * Common utility functions
 */

import type { Lead, LeadStage, DashboardStats } from './types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date to French locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleDateString('fr-FR', options || {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format date and time to French locale
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format currency in euros
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate French phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate SIRET number (14 digits)
 */
export function isValidSiret(siret: string): boolean {
  const cleanSiret = siret.replace(/\s/g, '');
  return /^\d{14}$/.test(cleanSiret);
}

/**
 * Validate French zip code
 */
export function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode);
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate statistics from leads
 */
export function calculateStats(leads: Lead[]): DashboardStats {
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.stage === 'won' || l.stage === 'closed_won').length;
  const lostLeads = leads.filter(l => l.stage === 'lost' || l.stage === 'closed_lost').length;
  const activeLeads = totalLeads - wonLeads - lostLeads;

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const wonValue = leads
    .filter(l => l.stage === 'won' || l.stage === 'closed_won')
    .reduce((sum, lead) => sum + (lead.value || 0), 0);

  const averageValue = totalLeads > 0 ? totalValue / totalLeads : 0;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  // Group by stage
  const leadsByStage = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<LeadStage, number>);

  const valueByStage = leads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + (lead.value || 0);
    return acc;
  }, {} as Record<LeadStage, number>);

  return {
    totalLeads,
    wonLeads,
    lostLeads,
    activeLeads,
    totalValue,
    wonValue,
    averageValue,
    conversionRate,
    leadsByStage,
    valueByStage
  };
}

/**
 * Sort leads by field
 */
export function sortLeads<K extends keyof Lead>(
  leads: Lead[],
  field: K,
  direction: 'asc' | 'desc' = 'asc'
): Lead[] {
  return [...leads].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal, 'fr')
        : bVal.localeCompare(aVal, 'fr');
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

/**
 * Filter leads by search term
 */
export function filterLeads(leads: Lead[], searchTerm: string): Lead[] {
  if (!searchTerm.trim()) {
    return leads;
  }

  const term = searchTerm.toLowerCase();

  return leads.filter(lead =>
    lead.name?.toLowerCase().includes(term) ||
    lead.contactName?.toLowerCase().includes(term) ||
    lead.email?.toLowerCase().includes(term) ||
    lead.phone?.includes(term) ||
    lead.company?.toLowerCase().includes(term) ||
    lead.notes?.toLowerCase().includes(term)
  );
}

/**
 * Get leads with actions due today
 */
export function getLeadsDueToday(leads: Lead[]): Lead[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return leads.filter(lead => {
    if (!lead.nextActions || lead.nextActions.length === 0) {
      return false;
    }

    return lead.nextActions.some(action => {
      if (!action.dueDate || action.completed) {
        return false;
      }

      const dueDate = new Date(action.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today && dueDate < tomorrow;
    });
  });
}

/**
 * Get overdue leads
 */
export function getOverdueLeads(leads: Lead[]): Lead[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return leads.filter(lead => {
    if (!lead.nextActions || lead.nextActions.length === 0) {
      return false;
    }

    return lead.nextActions.some(action => {
      if (!action.dueDate || action.completed) {
        return false;
      }

      const dueDate = new Date(action.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    });
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Check if two objects are equal (shallow comparison)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
