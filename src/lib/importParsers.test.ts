import { describe, it, expect } from 'vitest';
import {
  autoDetectField,
  autoDetectMapping,
  applyMapping,
  countImportable,
  isMappingValid,
  isMappingAutoSkippable,
  sampleValues,
  detectHeaderRowIndex,
  buildPreview,
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

  it('prioritizes Enseigne / Nom commercial as name (not company)', () => {
    expect(autoDetectField('Enseigne')).toBe('name');
    expect(autoDetectField('Nom commercial')).toBe('name');
    expect(autoDetectField("Nom d'enseigne")).toBe('name');
  });

  it('maps dirigeant/gerant to contactName', () => {
    expect(autoDetectField('Gérant')).toBe('contactName');
    expect(autoDetectField('Dirigeant')).toBe('contactName');
  });

  it('returns null for exotic/unknown headers', () => {
    expect(autoDetectField('Code NAF')).toBeNull();
    expect(autoDetectField('Forme juridique')).toBeNull();
  });
});

describe('isMappingAutoSkippable', () => {
  it('requires name/company AND a contact channel', () => {
    expect(isMappingAutoSkippable({ 0: 'name', 1: 'email' })).toBe(true);
    expect(isMappingAutoSkippable({ 0: 'company', 1: 'phone' })).toBe(true);
    expect(isMappingAutoSkippable({ 0: 'name' })).toBe(false); // no contact
    expect(isMappingAutoSkippable({ 0: 'email', 1: 'phone' })).toBe(false); // no identity
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

describe('detectHeaderRowIndex', () => {
  it('finds the header row buried below section titles (Chablais-style)', () => {
    const grid = [
      ['', 'Sous-Secteur', 'Communes à exploiter', '', '', 'Profil de Potentiel'],
      ['', 'Bassin Thononais', 'Thonon, Publier', '', '', 'Élevé'],
      ['', 'Bas-Chablais', 'Douvaine, Sciez', '', '', 'Très élevé'],
      [],
      ['N°', 'Entreprise', 'Ville', 'Département', 'Téléphone', 'Dirigeant local'],
      [1, 'Garage X', 'Thonon', '74', '04 50 00 00 00', 'Jean Martin'],
      [2, 'Garage Y', 'Evian', '74', '04 50 11 11 11', 'Alice Durand'],
    ];
    expect(detectHeaderRowIndex(grid)).toBe(4);
  });

  it('falls back to 0 when no row has enough Lead-field cells', () => {
    const grid = [
      ['Garbage col A', 'Garbage col B'],
      ['value1', 'value2'],
    ];
    expect(detectHeaderRowIndex(grid)).toBe(0);
  });
});

describe('buildPreview', () => {
  it('slices headers from chosen row, data from rows after', () => {
    const grid = [
      ['title'],
      ['Nom', 'Email'],
      ['Lead 1', 'a@x'],
      ['Lead 2', 'b@x'],
    ];
    const preview = buildPreview(grid, 1, 'f.xlsx');
    expect(preview.headers).toEqual(['Nom', 'Email']);
    expect(preview.rows).toHaveLength(2);
    expect(preview.headerRowIndex).toBe(1);
    expect(preview.allRows).toHaveLength(4);
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
