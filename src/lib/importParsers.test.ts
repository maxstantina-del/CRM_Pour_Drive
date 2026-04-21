import { describe, it, expect } from 'vitest';
import {
  autoDetectField,
  autoDetectMapping,
  applyMapping,
  countImportable,
  isMappingValid,
  sampleValues,
} from './importParsers';

describe('autoDetectField', () => {
  it('detects common FR and EN aliases', () => {
    expect(autoDetectField('Nom')).toBe('name');
    expect(autoDetectField('Dénomination sociale')).toBe('company');
    expect(autoDetectField('Raison sociale')).toBe('company');
    expect(autoDetectField('Email')).toBe('email');
    expect(autoDetectField('Téléphone fixe')).toBe('phone');
    expect(autoDetectField('Représentant légal')).toBe('contactName');
    expect(autoDetectField('Code Postal')).toBe('zipCode');
    expect(autoDetectField('CA 2024')).toBe('value');
    expect(autoDetectField('Commune')).toBe('city');
  });

  it('returns null for exotic/unknown headers', () => {
    expect(autoDetectField('Code NAF')).toBeNull();
    expect(autoDetectField('Forme juridique')).toBeNull();
  });
});

describe('autoDetectMapping', () => {
  it('does not reuse the same Lead field twice', () => {
    const headers = ['Nom', 'Dénomination sociale'];
    const m = autoDetectMapping(headers);
    // 'Nom' wins for `name` first; 'Dénomination' goes to `company`
    expect(m[0]).toBe('name');
    expect(m[1]).toBe('company');
  });

  it('skips unknown headers', () => {
    const m = autoDetectMapping(['Email', 'Code NAF', 'Téléphone']);
    expect(m[0]).toBe('email');
    expect(m[1]).toBeUndefined();
    expect(m[2]).toBe('phone');
  });
});

describe('applyMapping', () => {
  it('applies manual mapping for exotic columns', () => {
    const headers = ['Dénomination', 'Rep', 'CA'];
    const rows = [['Garage Dupont', 'Jean D.', '12 000 €'], ['', '', '']];
    const mapping = { 0: 'company', 1: 'contactName', 2: 'value' } as const;
    const leads = applyMapping(headers, rows, mapping, 'pipe-1');
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      company: 'Garage Dupont',
      contactName: 'Jean D.',
      value: 12000,
      pipelineId: 'pipe-1',
    });
  });

  it('drops rows without name OR company', () => {
    const headers = ['Nom', 'Ville'];
    const rows = [['Lead A', 'Paris'], ['', 'Lyon']];
    const m = { 0: 'name', 1: 'city' } as const;
    expect(applyMapping(headers, rows, m, 'p').length).toBe(1);
  });

  it('normalizes stage from FR labels', () => {
    const headers = ['Nom', 'Stage'];
    const rows = [['A', 'Contacté'], ['B', 'Gagné']];
    const m = { 0: 'name', 1: 'stage' } as const;
    const out = applyMapping(headers, rows, m, 'p');
    expect(out[0].stage).toBe('contacted');
    expect(out[1].stage).toBe('won');
  });

  it('parses FR number formats (12,50 and 12 000)', () => {
    const headers = ['Nom', 'Valeur'];
    const rows = [['A', '12,50'], ['B', '12 000 €']];
    const m = { 0: 'name', 1: 'value' } as const;
    const out = applyMapping(headers, rows, m, 'p');
    expect(out[0].value).toBe(12.5);
    expect(out[1].value).toBe(12000);
  });
});

describe('countImportable / isMappingValid', () => {
  it('counts rows with name or company; flags mapping without name/company as invalid', () => {
    const headers = ['Nom', 'Email'];
    const rows = [['A', 'a@x'], ['', 'b@x']];
    expect(countImportable(headers, rows, { 0: 'name', 1: 'email' })).toEqual({ importable: 1, skipped: 1 });
    expect(isMappingValid({ 0: 'name' })).toBe(true);
    expect(isMappingValid({ 0: 'email' })).toBe(false);
  });
});

describe('sampleValues', () => {
  it('returns up to N non-empty values, truncated', () => {
    const rows = [['', 'x'], ['Hello world this is a long value that exceeds thirty chars', 'y']];
    expect(sampleValues(rows, 1, 3)).toEqual(['x', 'y']);
    const truncated = sampleValues(rows, 0, 3);
    expect(truncated[0]).toMatch(/…$/);
  });
});
