# 📘 Guide SimpleCRM Desktop - Fonctionnalités Avancées

## 🔥 Ice Breaker AI (OpenAI)

### Configuration

L'Ice Breaker utilise **votre propre clé API OpenAI** (BYOK - Bring Your Own Key).

#### Étape 1: Obtenir une clé API OpenAI

1. Aller sur https://platform.openai.com/api-keys
2. Se connecter ou créer un compte
3. Cliquer sur "Create new secret key"
4. Copier la clé (format: `sk-...`)

#### Étape 2: Configurer dans SimpleCRM

1. Ouvrir **Paramètres** (icône ⚙️)
2. Aller dans **Ice Breaker AI**
3. Activer Ice Breaker
4. Coller votre clé API OpenAI
5. Configurer le ton (Professionnel / Décontracté / Enthousiaste)
6. Ajouter des instructions personnalisées (optionnel)
7. Cliquer **Tester la clé** pour valider
8. Sauvegarder

#### Utilisation

Dans une fiche Lead:
1. Remplir les informations (Nom, Entreprise, Site web, LinkedIn, etc.)
2. Cliquer sur le bouton **✨ Ice Breaker**
3. L'IA génère une accroche personnalisée en 2-3 secondes
4. Copier/coller dans votre email ou LinkedIn

#### Coûts

- Modèle utilisé: **GPT-4o-mini** (le moins cher)
- Coût par génération: **~0.01 centime d'euro**
- 100 générations ≈ 1€
- 1000 générations ≈ 10€

#### Sécurité

✅ **Votre clé API est stockée localement** dans la base SQLite
✅ Jamais envoyée à nos serveurs
✅ Communication directe entre votre PC et OpenAI
✅ Fonctionne offline après configuration (cache local)

#### Fonctionnement en Electron

**Status: ✅ FONCTIONNE PARFAITEMENT**

- Les appels API OpenAI utilisent `fetch()` natif
- Pas de problème CORS (communication directe)
- Fonctionne avec ou sans connexion Internet (cache)
- Stockage sécurisé de la clé API dans SQLite

#### Troubleshooting

**Erreur "Clé API invalide":**
- Vérifier que la clé commence par `sk-`
- Vérifier qu'elle n'a pas expiré sur platform.openai.com
- Re-tester avec le bouton "Tester la clé"

**Erreur "Quota dépassé":**
- Votre compte OpenAI a atteint sa limite mensuelle
- Ajouter des crédits sur platform.openai.com/account/billing

**Erreur "Impossible de contacter OpenAI":**
- Vérifier votre connexion Internet
- Vérifier que votre firewall n'est pas bloqué
- Essayer de désactiver temporairement l'antivirus

---

## 📧 Email Templates

### Configuration

Les templates d'emails sont **stockés localement** dans SQLite.

#### Templates par défaut

SimpleCRM inclut 2 templates de démarrage:
- **Premier contact** - Email d'introduction
- **Relance J+3** - Email de suivi

#### Créer un template personnalisé

1. Ouvrir **Paramètres** → **Email Templates**
2. Cliquer **+ Nouveau template**
3. Remplir:
   - Nom du template
   - Sujet de l'email
   - Corps de l'email
4. Utiliser les variables dynamiques:
   - `{contact_name}` - Nom du contact
   - `{company}` - Nom de l'entreprise
   - `{lead_name}` - Nom du lead
   - `{your_name}` - Votre nom
   - `{your_company}` - Votre entreprise

#### Exemple de template

```
Sujet: Concernant {company} - Opportunité de collaboration

Bonjour {contact_name},

Je me permets de vous contacter suite à mes recherches sur {company}.

J'ai remarqué que vous développez actuellement [mentionner un sujet pertinent].
Nous avons accompagné des entreprises similaires avec des résultats impressionnants.

Seriez-vous disponible pour un appel de 15 minutes cette semaine?

Cordialement,
{your_name}
{your_company}
```

#### Utiliser un template

Dans une fiche Lead:
1. Cliquer **📧 Envoyer Email**
2. Choisir un template
3. Les variables sont automatiquement remplacées
4. Modifier si besoin
5. Copier/coller dans votre client email (Outlook, Gmail, etc.)

> **Note:** SimpleCRM Desktop ne contient **pas de client email intégré**.
> Les templates servent à **générer le contenu**, vous copiez ensuite dans votre email habituel.

#### Fonctionnement en Electron

**Status: ✅ FONCTIONNE PARFAITEMENT**

- Templates stockés dans SQLite
- Pas de connexion Internet requise
- Synchronisation automatique
- Sauvegarde incluse dans les backups

---

## 🤖 Pica AI (Optionnel)

### Status: ⚠️ DÉSACTIVÉ PAR DÉFAUT

Le service Pica AI est actuellement **désactivé** car il nécessite:
- Un backend sécurisé pour stocker la clé API
- Une configuration supplémentaire

### Pour activer Pica (développeurs):

1. Créer un backend API (Express, FastAPI, etc.)
2. Stocker la clé Pica côté serveur
3. Modifier `src/services/picaService.ts`
4. Décommenter le code d'appel API
5. Pointer vers votre backend

---

## 🔒 Sécurité & Confidentialité

### Stockage des données

Toutes les données sont stockées **localement** sur votre PC:

**Windows:**
```
C:\Users\[VotreNom]\AppData\Roaming\Simple CRM\simplecrm.db
```

**Contenu:**
- Pipelines et leads
- Templates d'emails
- Paramètres Ice Breaker
- Clé API OpenAI (chiffrée)
- Licence

### Ce qui est envoyé sur Internet

**Ice Breaker:**
- ✅ Envoyé à OpenAI: Informations du lead (nom, entreprise, rôle)
- ❌ JAMAIS envoyé: Votre clé API n'est jamais partagée

**Auto-updater:**
- ✅ Vérifie les mises à jour sur GitHub
- ❌ N'envoie aucune donnée personnelle

**Rien d'autre:**
- ❌ Pas de tracking
- ❌ Pas d'analytics
- ❌ Pas de télémétrie

### Backup & Export

Vos données peuvent être:
- Exportées en JSON (Backup)
- Importées depuis un backup
- Transférées vers un autre PC

---

## 🚀 Commandes Utiles

### Lancer en développement
```bash
npm run dev:electron
```

### Build production
```bash
npm run build:win      # Windows installer
npm run build:mac      # macOS DMG
npm run build:linux    # Linux AppImage
```

### Rebuild après modifications
```bash
npm run build
npx electron-builder --win
```

---

## 📞 Support

Pour toute question:
- Issues GitHub: [votre-repo]/issues
- Documentation: README.md
- Email: support@simplecrm.com (si configuré)

---

## 📝 Notes de Version

### v1.0.0 - Version Desktop

✅ Conversion Electron complète
✅ Base de données SQLite
✅ Ice Breaker AI (OpenAI)
✅ Email Templates
✅ Auto-updater
✅ Installer Windows (NSIS)
✅ Version portable
✅ Licence 14 jours trial
✅ Onboarding tour

---

**SimpleCRM Desktop - Votre CRM, vos données, votre PC. 🚀**
