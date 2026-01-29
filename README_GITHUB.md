# 🚀 Simple CRM - Gestion de Leads Moderne

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Tests](https://img.shields.io/badge/tests-62%20passing-success)
![License](https://img.shields.io/badge/license-Proprietary-red)

**CRM simple et puissant pour gérer vos leads efficacement**

[Demo](#) · [Documentation](./docs) · [Déploiement](./DEPLOY.md)

</div>

---

## ✨ Fonctionnalités

### 📊 Gestion Complète des Leads
- ✅ **CRUD complet** - Créer, lire, modifier, supprimer
- ✅ **Champs riches** - Contact, entreprise, SIRET, adresse, valeur, probabilité
- ✅ **Next actions** - Tâches avec dates d'échéance
- ✅ **QR Code** - Génération automatique pour partage rapide

### 🎯 Pipeline Multi-étapes
- ✅ **Kanban visuel** - Drag & drop entre les étapes
- ✅ **Étapes personnalisables** - Nouveau, Contacté, Qualifié, RDV, Proposition, Négociation, Gagné, Perdu
- ✅ **Multi-pipelines** - Gérez plusieurs pipelines en parallèle
- ✅ **Célébration animée** - Confetti et trophée quand un lead est gagné 🎉

### 📈 Vues Multiples
- ✅ **Dashboard** - Statistiques complètes et graphiques
- ✅ **Pipeline** - Vue Kanban avec colonnes par étape
- ✅ **Tableau** - Vue table avec tri et filtres
- ✅ **Aujourd'hui** - Actions dues aujourd'hui et en retard
- ✅ **Paramètres** - Configuration de l'application

### 💾 Import/Export
- ✅ **Import** - CSV, JSON, Excel (.xlsx, .xls)
- ✅ **Export** - CSV, Excel
- ✅ **Backup** - Sauvegarde complète en JSON
- ✅ **Restore** - Restauration depuis backup

### 🔄 Synchronisation
- ✅ **LocalStorage** - Persistance locale automatique
- ✅ **Supabase** - Synchronisation cloud optionnelle
- ✅ **Real-time** - Mises à jour en temps réel

### 🤖 Fonctionnalités Avancées
- ✅ **Assistant IA** - Chat conversationnel pour aide
- ✅ **Tour guidé** - Onboarding pour nouveaux utilisateurs
- ✅ **Toast notifications** - Feedback utilisateur temps réel
- ✅ **Error boundary** - Gestion élégante des erreurs

---

## 🛠️ Stack Technique

### Frontend
- **React** 18.3.1 - Bibliothèque UI
- **TypeScript** 5.6 - Typage statique strict
- **Vite** 5.4.8 - Build tool ultra-rapide
- **Tailwind CSS** 3.4.17 - Framework CSS utility-first

### UI/UX
- **Framer Motion** 12.23.26 - Animations fluides
- **Lucide React** 0.344.0 - Icônes modernes
- **Canvas Confetti** 1.9.4 - Célébrations animées
- **QRCode.react** 3.1.0 - Génération QR codes

### Backend & Data
- **Supabase** 2.91.0 - Base de données PostgreSQL + Real-time
- **XLSX** 0.18.5 - Import/Export Excel
- **LocalStorage** - Persistance locale

### Testing & Quality
- **Vitest** 4.0.18 - Tests unitaires ultra-rapides
- **@testing-library/react** 16.3.2 - Tests de composants
- **ESLint** 9.9.1 - Linting
- **TypeScript strict mode** - Typage strict

---

## 📦 Installation

### Prérequis
- Node.js 20+
- npm ou yarn

### Installation Locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/simple-crm.git
cd simple-crm

# Installer les dépendances
npm install

# Copier .env.example vers .env
cp .env.example .env

# Configurer les variables (optionnel pour Supabase)
nano .env

# Lancer en développement
npm run dev
```

L'application sera disponible sur http://localhost:5173

---

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec interface UI
npm run test:ui

# Tests une fois (CI)
npm run test:run

# Coverage
npm run test:coverage
```

**62 tests** couvrent:
- ✅ Hooks (useLeads, usePipelines)
- ✅ Utils (validation, formatting, stats)
- ✅ Components (Button, modals, forms)

---

## 🚀 Déploiement

### Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votre-username/simple-crm)

Ou manuellement:

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/votre-username/simple-crm)

**Voir [DEPLOY.md](./DEPLOY.md) pour le guide complet**

---

## 📊 Métriques

| Métrique | Valeur |
|----------|--------|
| Bundle size (gzip) | 305 KB |
| Tests | 62 passants |
| Lignes de code | ~5000 |
| Composants | 44 |
| TypeScript | 100% |
| Coverage | À venir |

### Performance

- ⚡ **First Contentful Paint:** < 1.5s
- ⚡ **Time to Interactive:** < 3s
- ⚡ **Lighthouse Score:** > 90

---

## 📖 Documentation

### Structure du Projet

```
simple-crm/
├── src/
│   ├── lib/              # Types, utils, storage, supabase
│   ├── contexts/         # React contexts (Toast)
│   ├── hooks/            # Custom hooks
│   ├── components/
│   │   ├── ui/          # Composants réutilisables
│   │   ├── layout/      # Layout (Sidebar, Header)
│   │   ├── dashboard/   # Dashboard
│   │   ├── pipeline/    # Pipeline Kanban
│   │   ├── views/       # Vues (Table, Today, Settings)
│   │   ├── forms/       # Formulaires
│   │   ├── modals/      # Modales
│   │   ├── celebration/ # Animations
│   │   ├── onboarding/  # Tour guidé
│   │   └── ai/          # Chat agent
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── docs/
└── dist/                 # Build de production
```

### Commandes Disponibles

```bash
npm run dev          # Développement (port 5173)
npm run build        # Build production
npm run preview      # Prévisualiser build
npm run lint         # Linter
npm run typecheck    # Vérification TypeScript
npm test             # Tests unitaires
npm run test:ui      # Tests avec UI
npm run test:coverage # Coverage
```

---

## 🔐 Sécurité

### ✅ Implémenté

- Headers de sécurité (CSP, X-Frame-Options, etc.)
- Protection RGPD (données clients exclues)
- Validation des données (email, téléphone, SIRET)
- Error boundary pour gestion d'erreurs
- TypeScript strict mode
- .env ignoré par Git

### ⚠️ À Faire Avant Production

1. **Révoquer les clés Supabase exposées**
2. Générer de nouvelles clés dans Supabase Dashboard
3. Configurer les variables d'environnement dans Vercel/Netlify
4. Activer Sentry pour monitoring
5. Configurer rate limiting

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- ✅ Écrire des tests pour les nouvelles fonctionnalités
- ✅ Suivre les conventions TypeScript
- ✅ Documenter les fonctions complexes
- ✅ Tester localement avant PR

---

## 📝 Roadmap

### Version 2.1 (Q1 2026)
- [ ] Mode sombre
- [ ] Recherche avancée avec filtres
- [ ] Templates d'emails
- [ ] Intégration calendrier
- [ ] Notifications push

### Version 2.2 (Q2 2026)
- [ ] API REST publique
- [ ] Webhooks
- [ ] Intégrations (Zapier, Make)
- [ ] Mobile app (React Native)

### Version 3.0 (Q3 2026)
- [ ] Intelligence artificielle avancée
- [ ] Scoring automatique des leads
- [ ] Prédiction de conversion
- [ ] Recommandations d'actions

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 🙏 Remerciements

- **React Team** - Pour React
- **Vercel** - Pour Vite et le hosting
- **Supabase** - Pour la base de données
- **Lucide** - Pour les icônes
- **Tailwind Labs** - Pour Tailwind CSS

---

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Rejoindre](https://discord.gg/example)
- 📖 Docs: [Documentation complète](./docs)
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/simple-crm/issues)

---

<div align="center">

**Fait avec ❤️ par l'équipe Simple CRM**

⭐ **N'oubliez pas de mettre une étoile si vous aimez ce projet !** ⭐

</div>
