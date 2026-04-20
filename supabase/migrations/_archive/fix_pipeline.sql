-- Créer le pipeline manquant dans Supabase
INSERT INTO pipelines (id, name, stages, created_at, updated_at)
VALUES (
  'afea57eb-6dba-46fc-9665-2afd34aff63d',
  'Pipeline Principal',
  '[
    {"id": "new", "name": "Nouveau", "color": "#6366f1"},
    {"id": "contacted", "name": "Contacté", "color": "#3b82f6"},
    {"id": "qualified", "name": "Qualifié", "color": "#8b5cf6"},
    {"id": "proposal", "name": "Proposition", "color": "#f59e0b"},
    {"id": "negotiation", "name": "Négociation", "color": "#f97316"},
    {"id": "won", "name": "Gagné", "color": "#10b981"},
    {"id": "lost", "name": "Perdu", "color": "#ef4444"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
