import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

/**
 * Module de gestion de la base de données SQLite pour Electron
 *
 * Remplace localStorage pour un stockage local robuste et performant
 */

let db: Database.Database | null = null;

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'simplecrm.db');

  // Crée le dossier s'il n'existe pas
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Active les foreign keys
  db.pragma('foreign_keys = ON');

  // Crée les tables si elles n'existent pas
  createTables();

  console.log(`✅ Database initialized at: ${dbPath}`);

  return db;
}

function createTables() {
  if (!db) throw new Error('Database not initialized');

  // Table pipelines
  db.exec(`
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Table leads
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      pipelineId TEXT NOT NULL,
      name TEXT NOT NULL,
      contactName TEXT,
      jobTitle TEXT,
      email TEXT,
      phone TEXT,
      mobile TEXT,
      company TEXT,
      siret TEXT,
      address TEXT,
      city TEXT,
      postalCode TEXT,
      country TEXT,
      source TEXT,
      website TEXT,
      linkedin TEXT,
      offerUrl TEXT,
      stage TEXT NOT NULL,
      value REAL DEFAULT 0,
      notes TEXT,
      nextAction TEXT,
      nextActionDate TEXT,
      nextActionTime TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (pipelineId) REFERENCES pipelines(id) ON DELETE CASCADE
    )
  `);
  ensureLeadColumns();

  // Table stages (configuration des étapes personnalisées)
  db.exec(`
    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      pipelineId TEXT NOT NULL,
      label TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'gray',
      icon TEXT,
      emoji TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (pipelineId) REFERENCES pipelines(id) ON DELETE CASCADE
    )
  `);

  // Table settings (paramètres globaux)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Table custom_actions (actions personnalisées)
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_actions (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Table email_templates
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Table team_members
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Index pour optimiser les requêtes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipelineId);
    CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
    CREATE INDEX IF NOT EXISTS idx_leads_nextActionDate ON leads(nextActionDate);
    CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  `);
}

function ensureLeadColumns() {
  if (!db) return;

  const columns = db.prepare('PRAGMA table_info(leads)').all().map((col: any) => col.name);
  if (!columns.includes('offerUrl')) {
    db.exec('ALTER TABLE leads ADD COLUMN offerUrl TEXT');
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database closed');
  }
}

// CRUD Helpers pour faciliter l'utilisation depuis le renderer

export const dbHelpers = {
  // Generic helpers
  query: (sql: string, params: any[] = []) => {
    return getDatabase().prepare(sql).all(...params);
  },

  get: (sql: string, params: any[] = []) => {
    return getDatabase().prepare(sql).get(...params);
  },

  run: (sql: string, params: any[] = []) => {
    return getDatabase().prepare(sql).run(...params);
  },

  exec: (sql: string) => {
    return getDatabase().exec(sql);
  },

  // Pipelines
  getAllPipelines: () => {
    return getDatabase().prepare('SELECT * FROM pipelines ORDER BY createdAt DESC').all();
  },

  getPipeline: (id: string) => {
    return getDatabase().prepare('SELECT * FROM pipelines WHERE id = ?').get(id);
  },

  createPipeline: (pipeline: { id: string; name: string; createdAt: string }) => {
    const stmt = getDatabase().prepare('INSERT INTO pipelines (id, name, createdAt) VALUES (?, ?, ?)');
    return stmt.run(pipeline.id, pipeline.name, pipeline.createdAt);
  },

  updatePipeline: (id: string, name: string) => {
    const stmt = getDatabase().prepare('UPDATE pipelines SET name = ? WHERE id = ?');
    return stmt.run(name, id);
  },

  deletePipeline: (id: string) => {
    const stmt = getDatabase().prepare('DELETE FROM pipelines WHERE id = ?');
    return stmt.run(id);
  },

  // Leads
  getAllLeads: (pipelineId?: string) => {
    if (pipelineId) {
      return getDatabase().prepare('SELECT * FROM leads WHERE pipelineId = ? ORDER BY created_at DESC').all(pipelineId);
    }
    return getDatabase().prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  },

  getLead: (id: string) => {
    return getDatabase().prepare('SELECT * FROM leads WHERE id = ?').get(id);
  },

  createLead: (lead: any) => {
    const stmt = getDatabase().prepare(`
      INSERT INTO leads (
        id, pipelineId, name, contactName, jobTitle, email, phone, mobile,
        company, siret, address, city, postalCode, country, source, website,
        linkedin, offerUrl, stage, value, notes, nextAction, nextActionDate, nextActionTime,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    return stmt.run(
      lead.id, lead.pipelineId, lead.name, lead.contactName, lead.jobTitle,
      lead.email, lead.phone, lead.mobile, lead.company, lead.siret,
      lead.address, lead.city, lead.postalCode, lead.country, lead.source,
      lead.website, lead.linkedin, lead.offerUrl, lead.stage, lead.value, lead.notes,
      lead.nextAction, lead.nextActionDate, lead.nextActionTime,
      lead.created_at, lead.updated_at
    );
  },

  updateLead: (id: string, updates: any) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = getDatabase().prepare(`UPDATE leads SET ${fields}, updated_at = ? WHERE id = ?`);
    return stmt.run(...values, new Date().toISOString(), id);
  },

  deleteLead: (id: string) => {
    const stmt = getDatabase().prepare('DELETE FROM leads WHERE id = ?');
    return stmt.run(id);
  },

  deleteMultipleLeads: (ids: string[]) => {
    const placeholders = ids.map(() => '?').join(',');
    const stmt = getDatabase().prepare(`DELETE FROM leads WHERE id IN (${placeholders})`);
    return stmt.run(...ids);
  },

  // Settings
  getSetting: (key: string) => {
    const result: any = getDatabase().prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  },

  setSetting: (key: string, value: string) => {
    const stmt = getDatabase().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    return stmt.run(key, value);
  },
};
