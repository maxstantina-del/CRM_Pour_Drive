/**
 * Script de test de performance pour SimpleCRM
 *
 * Ce script génère des données de test et mesure les performances
 * des différentes opérations du CRM avec des jeux de données de différentes tailles.
 *
 * Usage:
 *   npm run test:perf
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface PerformanceResult {
  operation: string;
  dataSize: number;
  duration: number;
  success: boolean;
  details?: string;
}

const results: PerformanceResult[] = [];

// Génère des données de test
function generateTestLeads(count: number, pipelineId: string): any[] {
  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const companies = ['Acme Corp', 'TechStart Inc', 'Global Industries', 'Innovation Labs', 'Digital Solutions'];
  const sources = ['Website', 'Referral', 'Cold Call', 'LinkedIn', 'Email Campaign'];

  const leads = [];
  for (let i = 0; i < count; i++) {
    leads.push({
      id: `lead-${Date.now()}-${i}`,
      pipelineId,
      name: `Lead ${i}`,
      contactName: `Contact Person ${i}`,
      jobTitle: i % 2 === 0 ? 'CEO' : 'Sales Manager',
      email: `contact${i}@example.com`,
      phone: `+33${Math.floor(Math.random() * 1000000000)}`,
      mobile: `+33${Math.floor(Math.random() * 1000000000)}`,
      company: companies[i % companies.length],
      siret: `${Math.floor(Math.random() * 100000000000000)}`,
      address: `${i} Test Street`,
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      source: sources[i % sources.length],
      website: `https://company${i}.example.com`,
      linkedin: `https://linkedin.com/in/contact${i}`,
      stage: stages[i % stages.length],
      value: Math.floor(Math.random() * 100000),
      notes: `Notes for lead ${i}. This is a test lead generated for performance testing.`,
      nextAction: i % 3 === 0 ? 'Follow-up call' : 'Send proposal',
      nextActionDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextActionTime: '14:00',
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return leads;
}

// Mesure le temps d'exécution d'une fonction
async function measureTime<T>(
  operation: string,
  dataSize: number,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  let success = true;
  let result: T;

  try {
    result = await fn();
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = performance.now() - start;
    results.push({
      operation,
      dataSize,
      duration,
      success,
    });
    console.log(`✓ ${operation} (${dataSize} items): ${duration.toFixed(2)}ms`);
  }

  return result!;
}

// Test d'insertion batch
function testBatchInsert(db: Database.Database, leads: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO leads (
      id, pipelineId, name, contactName, jobTitle, email, phone, mobile,
      company, siret, address, city, postalCode, country, source, website,
      linkedin, stage, value, notes, nextAction, nextActionDate, nextActionTime,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertMany = db.transaction((leads: any[]) => {
    for (const lead of leads) {
      stmt.run(
        lead.id, lead.pipelineId, lead.name, lead.contactName, lead.jobTitle,
        lead.email, lead.phone, lead.mobile, lead.company, lead.siret,
        lead.address, lead.city, lead.postalCode, lead.country, lead.source,
        lead.website, lead.linkedin, lead.stage, lead.value, lead.notes,
        lead.nextAction, lead.nextActionDate, lead.nextActionTime,
        lead.created_at, lead.updated_at
      );
    }
  });

  insertMany(leads);
}

// Test de requêtes
async function runPerformanceTests() {
  console.log('\n🚀 SimpleCRM Performance Tests\n');
  console.log('='.repeat(60));

  // Créer une base de données temporaire pour les tests
  const testDbPath = path.join(process.cwd(), 'test-performance.db');

  // Supprimer la DB de test si elle existe
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const db = new Database(testDbPath);
  db.pragma('foreign_keys = ON');

  // Créer les tables
  db.exec(`
    CREATE TABLE pipelines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE leads (
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
      stage TEXT NOT NULL,
      value REAL DEFAULT 0,
      notes TEXT,
      nextAction TEXT,
      nextActionDate TEXT,
      nextActionTime TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (pipelineId) REFERENCES pipelines(id) ON DELETE CASCADE
    );
  `);

  // Créer un pipeline de test
  const pipelineId = 'test-pipeline-1';
  db.prepare('INSERT INTO pipelines (id, name, createdAt) VALUES (?, ?, ?)').run(
    pipelineId,
    'Test Pipeline',
    new Date().toISOString()
  );

  // Tests avec différentes tailles de données
  const testSizes = [100, 1000, 5000, 10000];

  for (const size of testSizes) {
    console.log(`\n📊 Tests avec ${size} leads\n`);
    console.log('-'.repeat(60));

    // Générer les leads
    const leads = generateTestLeads(size, pipelineId);

    // Test 1: Insertion batch (SANS index)
    await measureTime(`Insertion batch (sans index)`, size, () => {
      testBatchInsert(db, leads);
    });

    // Créer les index
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipelineId);
      CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
      CREATE INDEX IF NOT EXISTS idx_leads_nextActionDate ON leads(nextActionDate);
      CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
      CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    `);

    // Test 2: SELECT tous les leads
    await measureTime(`SELECT * (tous les leads)`, size, () => {
      return db.prepare('SELECT * FROM leads').all();
    });

    // Test 3: SELECT avec WHERE pipelineId
    await measureTime(`SELECT WHERE pipelineId`, size, () => {
      return db.prepare('SELECT * FROM leads WHERE pipelineId = ?').all(pipelineId);
    });

    // Test 4: SELECT avec WHERE stage
    await measureTime(`SELECT WHERE stage`, size, () => {
      return db.prepare('SELECT * FROM leads WHERE stage = ?').all('qualified');
    });

    // Test 5: Recherche par nom (LIKE)
    await measureTime(`SEARCH name LIKE`, size, () => {
      return db.prepare('SELECT * FROM leads WHERE name LIKE ?').all('%Lead 1%');
    });

    // Test 6: Recherche par email
    await measureTime(`SEARCH email`, size, () => {
      return db.prepare('SELECT * FROM leads WHERE email LIKE ?').all('%contact1%');
    });

    // Test 7: COUNT
    await measureTime(`COUNT(*)`, size, () => {
      return db.prepare('SELECT COUNT(*) as count FROM leads WHERE pipelineId = ?').get(pipelineId);
    });

    // Test 8: Pagination (LIMIT + OFFSET)
    await measureTime(`Pagination LIMIT 100 OFFSET 0`, size, () => {
      return db.prepare('SELECT * FROM leads WHERE pipelineId = ? LIMIT ? OFFSET ?').all(pipelineId, 100, 0);
    });

    // Test 9: UPDATE
    await measureTime(`UPDATE lead`, size, () => {
      return db.prepare('UPDATE leads SET value = ? WHERE id = ?').run(50000, leads[0].id);
    });

    // Test 10: DELETE
    await measureTime(`DELETE lead`, size, () => {
      return db.prepare('DELETE FROM leads WHERE id = ?').run(leads[leads.length - 1].id);
    });

    // Nettoyer pour le prochain test
    if (size !== testSizes[testSizes.length - 1]) {
      db.exec('DROP TABLE leads');
      db.exec(`
        CREATE TABLE leads (
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
          stage TEXT NOT NULL,
          value REAL DEFAULT 0,
          notes TEXT,
          nextAction TEXT,
          nextActionDate TEXT,
          nextActionTime TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (pipelineId) REFERENCES pipelines(id) ON DELETE CASCADE
        );
      `);
    }
  }

  // Fermer la base de données
  db.close();

  // Supprimer le fichier de test
  fs.unlinkSync(testDbPath);

  // Générer le rapport
  console.log('\n' + '='.repeat(60));
  console.log('📈 Rapport de Performance\n');
  generateReport();
}

// Génère un rapport formaté
function generateReport() {
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.operation]) {
      acc[result.operation] = [];
    }
    acc[result.operation].push(result);
    return acc;
  }, {} as Record<string, PerformanceResult[]>);

  console.log('| Opération | 100 | 1,000 | 5,000 | 10,000 |');
  console.log('|-----------|-----|-------|-------|--------|');

  for (const [operation, operationResults] of Object.entries(grouped)) {
    const times = operationResults.map(r => {
      if (r.duration < 1) return '<1ms';
      if (r.duration < 1000) return `${Math.round(r.duration)}ms`;
      return `${(r.duration / 1000).toFixed(2)}s`;
    });

    console.log(`| ${operation.padEnd(25)} | ${times[0]?.padEnd(7) || '-'} | ${times[1]?.padEnd(9) || '-'} | ${times[2]?.padEnd(9) || '-'} | ${times[3]?.padEnd(10) || '-'} |`);
  }

  // Vérifications de performance
  console.log('\n🎯 Vérifications de Performance:\n');

  const checks = [
    { operation: 'Pagination LIMIT 100 OFFSET 0', size: 10000, threshold: 50, unit: 'ms' },
    { operation: 'SELECT WHERE pipelineId', size: 10000, threshold: 100, unit: 'ms' },
    { operation: 'SEARCH name LIKE', size: 10000, threshold: 200, unit: 'ms' },
    { operation: 'COUNT(*)', size: 10000, threshold: 50, unit: 'ms' },
  ];

  for (const check of checks) {
    const result = results.find(r => r.operation === check.operation && r.dataSize === check.size);
    if (result) {
      const passed = result.duration < check.threshold;
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check.operation} (${check.size} items): ${result.duration.toFixed(2)}ms ${passed ? '< ' : '> '}${check.threshold}${check.unit}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés!\n');
}

// Exécuter les tests
runPerformanceTests().catch(console.error);
