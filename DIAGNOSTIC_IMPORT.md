# 🔍 DIAGNOSTIC - Problème d'import XLSX

## ❌ PROBLÈME ACTUEL

Quand on importe 838 leads :
- ✅ Le fichier est lu correctement
- ✅ Les leads sont parsés
- ❌ **Ils ne s'affichent pas dans le pipeline**

## 🧩 ARCHITECTURE ACTUELLE (CONFUS)

```
┌─────────────────────────────────────────┐
│         IMPORT DE 838 LEADS             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ handleImport() │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ addBatchLeads()│
         └────┬───────┬───┘
              │       │
      ┌───────┘       └────────┐
      │                        │
      ▼                        ▼
┌──────────┐          ┌─────────────┐
│localStorage│        │  Supabase   │
│  (State)   │        │  (Database) │
└──────┬─────┘        └──────┬──────┘
       │                     │
       │    ⚠️ CONFLIT ⚠️   │
       │                     │
       └──────────┬──────────┘
                  ▼
           Quel est la source
            de vérité ???
```

## 🔴 PROBLÈMES IDENTIFIÉS

### 1. **Double source de vérité**
- `usePipelines.ts` charge depuis **Supabase** au démarrage (ligne 73-144)
- `usePipelines.ts` sauvegarde dans **localStorage** (ligne 54-66)
- Les deux peuvent être désynchronisés

### 2. **Race condition lors de l'import**
```javascript
// addBatchLeads met à jour le state local
setLeadsByPipeline(prev => ({ ...prev, [pipelineId]: [...prev[pipelineId], ...newLeads] }));

// Puis insère dans Supabase
await supabase.from('leads').insert(supabaseLeads);

// MAIS le useEffect peut recharger depuis Supabase pendant ce temps !
// Et écraser les données locales
```

### 3. **Pas de gestion d'erreur visible**
Si Supabase échoue, l'utilisateur ne le sait pas.

## ✅ SOLUTIONS POSSIBLES

### Option A : **Supabase UNIQUEMENT** (Recommandé)
- Supprimer localStorage pour les leads
- Source unique de vérité : Supabase
- Plus simple, plus fiable

### Option B : **localStorage UNIQUEMENT**
- Supprimer Supabase
- Tout en local
- Plus rapide mais pas de sync multi-device

### Option C : **Hybrid avec priorité claire**
- localStorage = cache
- Supabase = source de vérité
- Pas de write dans localStorage, seulement read

## 🎯 RECOMMANDATION

Pour un CRM avec 838 leads, **Supabase est la meilleure option**.

Action immédiate :
1. Désactiver le write dans localStorage
2. Forcer le reload depuis Supabase après import
3. Ajouter un indicateur de chargement
