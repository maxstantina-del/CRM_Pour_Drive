import { describe, it, expect } from 'vitest';
import { handle, parseIntent } from './chatCommands';
import type { Lead } from '../../lib/types';

const now = new Date().toISOString();
const leads: Lead[] = [
  { id: '1', name: 'Annecy Tabac', company: 'Tabac SA', city: 'Annecy', stage: 'new', value: 1000, createdAt: now, updatedAt: now },
  { id: '2', name: 'Paris Bar', company: 'Bar', city: 'Paris', stage: 'won', value: 5000, createdAt: now, updatedAt: now },
  { id: '3', name: 'Lyon Shop', company: 'Shop', city: 'Lyon', stage: 'qualified', value: 2500, createdAt: now, updatedAt: '2026-01-01T00:00:00Z' },
];

describe('chatCommands', () => {
  it('parses "stats" intent', () => {
    expect(parseIntent('stats').kind).toBe('stats');
    expect(parseIntent('bilan').kind).toBe('stats');
    // Phrases naturelles longues → route vers IA (unknown)
    expect(parseIntent('montre le bilan de mon pipeline svp').kind).toBe('unknown');
  });

  it('stats returns counts', () => {
    const out = handle('stats', leads);
    expect(out).toContain('3 leads');
    expect(out).toContain('1 gagnés');
  });

  it('top returns sorted by value', () => {
    const out = handle('top 2', leads);
    expect(out).toContain('Paris Bar');
    expect(out.indexOf('Paris Bar')).toBeLessThan(out.indexOf('Lyon Shop'));
  });

  it('search finds by city or name', () => {
    expect(handle('cherche Annecy', leads)).toContain('Annecy Tabac');
    expect(handle('ville paris', leads)).toContain('Paris Bar');
  });

  it('recall finds stale leads', () => {
    const out = handle('relancer 30', leads);
    expect(out).toContain('Lyon Shop'); // stale
    expect(out).not.toContain('Annecy Tabac'); // fresh
  });

  it('email template includes placeholders', () => {
    const out = handle('email proposal', leads);
    expect(out).toContain('{{company}}');
    expect(out).toContain('Proposition');
  });

  it('help lists commands', () => {
    expect(handle('aide', leads)).toContain('stats');
    expect(handle('', leads)).toContain('stats');
  });
});
