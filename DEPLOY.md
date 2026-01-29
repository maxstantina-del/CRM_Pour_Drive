# Guide de Déploiement

## Déploiement sur Vercel

### Prérequis

1. Compte Vercel (gratuit): https://vercel.com/signup
2. Git repository (GitHub, GitLab, ou Bitbucket)
3. Clés Supabase valides

### Option 1: Déploiement depuis l'interface Vercel (Recommandé)

#### Étape 1: Préparer le repository Git

```bash
# Si pas encore de commit
cd C:\Users\Max\Desktop\CRM_Pour_Drive-20260122T181907Z-3-001\CRM_Pour_Drive

# Vérifier les fichiers staged
git status

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Créer le premier commit
git commit -m "Initial commit: CRM complet avec tests

- 44 composants React/TypeScript
- Tests unitaires (62 tests)
- Support multi-pipelines
- Import/Export CSV/Excel
- Backup/Restore JSON
- Célébration animée
- Assistant IA
- Build optimisé

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Créer un repository sur GitHub
# Puis lier et push:
git remote add origin https://github.com/votre-username/simple-crm.git
git branch -M main
git push -u origin main
```

#### Étape 2: Importer sur Vercel

1. Aller sur https://vercel.com/new
2. Cliquer sur "Import Project"
3. Sélectionner votre repository Git
4. Vercel détectera automatiquement Vite

#### Étape 3: Configurer les variables d'environnement

Dans les paramètres du projet Vercel:

1. Aller dans **Settings** > **Environment Variables**
2. Ajouter les variables suivantes:

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_nouvelle_cle_anonyme
```

⚠️ **IMPORTANT:** N'utilisez PAS les anciennes clés exposées. Générez de nouvelles clés dans Supabase.

#### Étape 4: Déployer

1. Cliquer sur "Deploy"
2. Attendre 2-3 minutes
3. Votre CRM sera disponible sur `https://votre-projet.vercel.app`

### Option 2: Déploiement via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer (depuis le dossier du projet)
cd C:\Users\Max\Desktop\CRM_Pour_Drive-20260122T181907Z-3-001\CRM_Pour_Drive
vercel

# Suivre les instructions
# - Configurer le projet
# - Ajouter les variables d'environnement
# - Confirmer le déploiement

# Pour production
vercel --prod
```

### Configuration Automatique

Le fichier `vercel.json` est déjà configuré avec:

✅ **Build automatique** avec `npm run build`
✅ **SPA routing** (toutes les routes vers index.html)
✅ **Headers de sécurité** (X-Frame-Options, CSP, etc.)
✅ **Cache optimisé** pour les assets (31536000s)
✅ **Variables d'environnement** configurables

### Domains Personnalisés

Une fois déployé, vous pouvez:

1. Aller dans **Settings** > **Domains**
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions

### Déploiement Continu

Vercel déploie automatiquement:
- **Production:** À chaque push sur `main`
- **Preview:** À chaque pull request
- **Rollback:** Instantané vers version précédente

### URLs du Projet

Après déploiement, vous aurez:

- **Production:** `https://simple-crm.vercel.app`
- **Preview:** `https://simple-crm-git-branch.vercel.app`
- **Dashboard:** `https://vercel.com/votre-username/simple-crm`

---

## Déploiement sur Netlify (Alternative)

### Via Interface Web

1. Aller sur https://app.netlify.com/start
2. Connecter votre repository Git
3. Configurer:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Ajouter variables d'environnement
5. Déployer

### Via CLI Netlify

```bash
npm i -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### netlify.toml (à créer si nécessaire)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

---

## Variables d'Environnement Requises

Pour que l'application fonctionne en production, configurez:

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Non* |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Non* |

*Non obligatoire si vous utilisez uniquement localStorage (mode offline)

---

## Sécurité en Production

### ✅ Checklist Avant Déploiement

- [ ] Nouvelles clés Supabase générées
- [ ] Variables d'environnement configurées dans Vercel/Netlify
- [ ] `.env` dans `.gitignore` (déjà fait)
- [ ] Fichiers Excel clients exclus (déjà fait)
- [ ] Tests passent: `npm run test:run`
- [ ] Build réussit: `npm run build`
- [ ] TypeScript compile: `npm run typecheck`

### ✅ Headers de Sécurité (déjà configurés)

Le `vercel.json` inclut:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictif

---

## Monitoring Post-Déploiement

Une fois déployé:

1. **Vérifier les logs Vercel:**
   ```
   vercel logs https://votre-projet.vercel.app
   ```

2. **Tester les fonctionnalités:**
   - [ ] Création de lead
   - [ ] Import CSV/Excel
   - [ ] Export
   - [ ] Backup/Restore
   - [ ] Changement d'étape
   - [ ] Célébration

3. **Vérifier Sentry** (après intégration)

4. **Performance:**
   - Lighthouse score > 90
   - Time to Interactive < 3s
   - First Contentful Paint < 1.5s

---

## Rollback en Cas de Problème

### Sur Vercel

1. Aller dans **Deployments**
2. Trouver la version précédente
3. Cliquer sur les 3 points > "Promote to Production"

### Sur Netlify

1. Aller dans **Deploys**
2. Sélectionner un déploiement précédent
3. Cliquer sur "Publish deploy"

---

## URLs Utiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## Support

En cas de problème:

1. Vérifier les logs de build
2. Vérifier les variables d'environnement
3. Tester localement: `npm run build && npm run preview`
4. Contacter le support Vercel/Netlify si nécessaire

**Temps de déploiement estimé:** 5-10 minutes
**Coût:** Gratuit (plan Free de Vercel/Netlify)
