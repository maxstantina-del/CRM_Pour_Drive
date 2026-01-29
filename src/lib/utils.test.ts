/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatDate,
  formatCurrency,
  formatPercentage,
  isValidEmail,
  isValidPhone,
  isValidSiret,
  isValidZipCode,
  truncate,
  capitalize,
  getInitials,
  calculateStats,
  sortLeads,
  filterLeads,
  getLeadsDueToday,
  getOverdueLeads
} from './utils';
import type { Lead } from './types';

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});

describe('formatDate', () => {
  it('should format date to French locale', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    const formatted = formatDate(date);

    expect(formatted).toMatch(/15\/01\/2025/);
  });

  it('should handle invalid date', () => {
    const formatted = formatDate('invalid-date');
    expect(formatted).toBe('');
  });
});

describe('formatCurrency', () => {
  it('should format currency in euros', () => {
    expect(formatCurrency(1000)).toMatch(/1\s?000\s?€/);
    expect(formatCurrency(0)).toMatch(/0\s?€/);
  });
});

describe('formatPercentage', () => {
  it('should format percentage', () => {
    expect(formatPercentage(50)).toBe('50%');
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(100)).toBe('100%');
  });
});

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate correct French phone numbers', () => {
    expect(isValidPhone('0612345678')).toBe(true);
    expect(isValidPhone('01 23 45 67 89')).toBe(true);
    expect(isValidPhone('+33612345678')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
  });
});

describe('isValidSiret', () => {
  it('should validate correct SIRET numbers', () => {
    expect(isValidSiret('12345678901234')).toBe(true);
    expect(isValidSiret('123 456 789 01234')).toBe(true);
  });

  it('should reject invalid SIRET numbers', () => {
    expect(isValidSiret('123')).toBe(false);
    expect(isValidSiret('123456789012345')).toBe(false); // 15 digits
  });
});

describe('isValidZipCode', () => {
  it('should validate correct French zip codes', () => {
    expect(isValidZipCode('75001')).toBe(true);
    expect(isValidZipCode('69000')).toBe(true);
  });

  it('should reject invalid zip codes', () => {
    expect(isValidZipCode('123')).toBe(false);
    expect(isValidZipCode('750011')).toBe(false); // 6 digits
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that needs to be truncated';
    expect(truncate(text, 20)).toBe('This is a very lo...');
  });

  it('should not truncate short text', () => {
    const text = 'Short text';
    expect(truncate(text, 20)).toBe('Short text');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Marie-Claire Martin')).toBe('MM');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('JO');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('calculateStats', () => {
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Lead 1',
      stage: 'new',
      value: 1000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Lead 2',
      stage: 'won',
      value: 2000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '3',
      name: 'Lead 3',
      stage: 'lost',
      value: 500,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  it('should calculate correct statistics', () => {
    const stats = calculateStats(mockLeads);

    expect(stats.totalLeads).toBe(3);
    expect(stats.wonLeads).toBe(1);
    expect(stats.lostLeads).toBe(1);
    expect(stats.activeLeads).toBe(1);
    expect(stats.totalValue).toBe(3500);
    expect(stats.wonValue).toBe(2000);
    expect(stats.averageValue).toBeCloseTo(1166.67, 1);
    expect(stats.conversionRate).toBeCloseTo(33.33, 1);
  });

  it('should handle empty leads array', () => {
    const stats = calculateStats([]);

    expect(stats.totalLeads).toBe(0);
    expect(stats.wonLeads).toBe(0);
    expect(stats.lostLeads).toBe(0);
    expect(stats.activeLeads).toBe(0);
    expect(stats.totalValue).toBe(0);
    expect(stats.conversionRate).toBe(0);
  });
});

describe('sortLeads', () => {
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Charlie',
      stage: 'new',
      value: 300,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Alice',
      stage: 'won',
      value: 100,
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02'
    },
    {
      id: '3',
      name: 'Bob',
      stage: 'lost',
      value: 200,
      createdAt: '2025-01-03',
      updatedAt: '2025-01-03'
    }
  ];

  it('should sort leads by name ascending', () => {
    const sorted = sortLeads(mockLeads, 'name', 'asc');
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('should sort leads by name descending', () => {
    const sorted = sortLeads(mockLeads, 'name', 'desc');
    expect(sorted[0].name).toBe('Charlie');
    expect(sorted[2].name).toBe('Alice');
  });

  it('should sort leads by value', () => {
    const sorted = sortLeads(mockLeads, 'value', 'asc');
    expect(sorted[0].value).toBe(100);
    expect(sorted[2].value).toBe(300);
  });
});

describe('filterLeads', () => {
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Test Project',
      contactName: 'John Doe',
      email: 'john@example.com',
      stage: 'new',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Another Lead',
      contactName: 'Jane Smith',
      email: 'jane@example.com',
      stage: 'won',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  it('should filter leads by name', () => {
    const filtered = filterLeads(mockLeads, 'Test');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Test Project');
  });

  it('should filter leads by email', () => {
    const filtered = filterLeads(mockLeads, 'jane@');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].contactName).toBe('Jane Smith');
  });

  it('should return all leads for empty search', () => {
    const filtered = filterLeads(mockLeads, '');
    expect(filtered).toHaveLength(2);
  });

  it('should be case insensitive', () => {
    const filtered = filterLeads(mockLeads, 'JOHN');
    expect(filtered).toHaveLength(1);
  });
});

describe('getLeadsDueToday', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Lead 1',
      stage: 'new',
      nextActions: [
        {
          id: '1',
          text: 'Call today',
          completed: false,
          dueDate: today.toISOString(),
          createdAt: '2025-01-01'
        }
      ],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Lead 2',
      stage: 'new',
      nextActions: [
        {
          id: '2',
          text: 'Call tomorrow',
          completed: false,
          dueDate: new Date(today.getTime() + 86400000).toISOString(),
          createdAt: '2025-01-01'
        }
      ],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  it('should return leads due today', () => {
    const dueToday = getLeadsDueToday(mockLeads);
    expect(dueToday).toHaveLength(1);
    expect(dueToday[0].name).toBe('Lead 1');
  });
});

describe('getOverdueLeads', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Overdue Lead',
      stage: 'new',
      nextActions: [
        {
          id: '1',
          text: 'Was due yesterday',
          completed: false,
          dueDate: yesterday.toISOString(),
          createdAt: '2025-01-01'
        }
      ],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  it('should return overdue leads', () => {
    const overdue = getOverdueLeads(mockLeads);
    expect(overdue).toHaveLength(1);
    expect(overdue[0].name).toBe('Overdue Lead');
  });
});
