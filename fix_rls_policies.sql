-- ============================================
-- FIX RLS POLICIES - Autoriser l'accès anonyme
-- ============================================
-- Ce script désactive RLS pour permettre l'accès depuis le frontend
-- À exécuter dans le SQL Editor de Supabase

-- 1. DÉSACTIVER RLS sur toutes les tables (solution simple pour développement)
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pipelines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;

-- OU

-- 2. GARDER RLS ACTIVÉ mais créer des policies ouvertes (solution recommandée)
-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow all access" ON leads;
DROP POLICY IF EXISTS "Allow all access" ON pipelines;
DROP POLICY IF EXISTS "Allow all access" ON contacts;
DROP POLICY IF EXISTS "Allow all access" ON activities;
DROP POLICY IF EXISTS "Allow all access" ON notes;
DROP POLICY IF EXISTS "Allow all access" ON tasks;

DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert access for all users" ON leads;
DROP POLICY IF EXISTS "Enable update access for all users" ON leads;
DROP POLICY IF EXISTS "Enable delete access for all users" ON leads;

DROP POLICY IF EXISTS "Enable read access for all users" ON pipelines;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pipelines;
DROP POLICY IF EXISTS "Enable update access for all users" ON pipelines;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pipelines;

-- Créer des policies qui autorisent TOUT (pour développement)
-- Table: leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Table: pipelines
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pipelines" ON pipelines FOR ALL USING (true) WITH CHECK (true);

-- Table: contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

-- Table: activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Table: notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to notes" ON notes FOR ALL USING (true) WITH CHECK (true);

-- Table: tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Vérifier que les policies sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
