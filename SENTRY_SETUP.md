# Configuration Sentry pour Monitoring

## Qu'est-ce que Sentry ?

Sentry est une plateforme de monitoring d'erreurs qui permet de:
- 📊 **Tracker les erreurs** en production en temps réel
- 🔍 **Analyser les stack traces** complètes
- 👥 **Voir combien d'utilisateurs** sont affectés
- 📈 **Suivre les performances** de l'application
- 🎥 **Session Replay** - Voir ce que l'utilisateur faisait quand l'erreur s'est produite

---

## Étape 1: Créer un Compte Sentry

1. Aller sur https://sentry.io/signup/
2. Créer un compte gratuit (10,000 erreurs/mois incluses)
3. Vérifier votre email

---

## Étape 2: Créer un Projet

1. Une fois connecté, cliquer sur **"Create Project"**
2. Sélectionner **"React"** comme plateforme
3. Nommer le projet: **"simple-crm"**
4. Cliquer sur **"Create Project"**

---

## Étape 3: Obtenir le DSN

Après création du projet, Sentry vous donnera un **DSN** (Data Source Name):

```
https://examplePublicKey@o0.ingest.sentry.io/0
```

Copiez cette URL, vous en aurez besoin.

---

## Étape 4: Configurer l'Application

### En Développement Local

1. Ouvrir `.env`:
   ```bash
   nano .env
   ```

2. Décommenter et compléter la ligne Sentry:
   ```env
   VITE_SENTRY_DSN=https://votre-dsn@sentry.io/project-id
   ```

3. Sauvegarder et relancer:
   ```bash
   npm run dev
   ```

### En Production (Vercel)

1. Aller dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajouter:
   ```
   VITE_SENTRY_DSN=https://votre-dsn@sentry.io/project-id
   ```
4. Redéployer:
   ```bash
   vercel --prod
   ```

---

## Étape 5: Tester l'Intégration

### Test 1: Erreur JavaScript

Dans la console développeur de votre navigateur:

```javascript
throw new Error("Test Sentry");
```

Vous devriez voir l'erreur apparaître dans Sentry dans les 10 secondes.

### Test 2: Error Boundary

Modifiez temporairement un composant pour throw une erreur:

```tsx
function TestComponent() {
  throw new Error("Test Error Boundary");
  return <div>Test</div>;
}
```

L'ErrorBoundary va capturer l'erreur et l'envoyer à Sentry.

### Test 3: Capture Manuelle

Dans votre code:

```typescript
import { captureException, captureMessage } from './lib/sentry';

try {
  // Code risqué
  someRiskyOperation();
} catch (error) {
  captureException(error as Error, {
    context: 'someRiskyOperation',
    userId: 'test-user'
  });
}

// Ou pour un message simple
captureMessage('Import réussi avec warnings', 'warning');
```

---

## Configuration Avancée

### Source Maps

Pour voir le code source original dans Sentry (et non le code minifié):

1. Installer le plugin Sentry Vite:
   ```bash
   npm install --save-dev @sentry/vite-plugin
   ```

2. Créer `sentry.config.ts`:
   ```typescript
   import { sentryVitePlugin } from "@sentry/vite-plugin";

   export default {
     plugins: [
       sentryVitePlugin({
         org: "votre-org",
         project: "simple-crm",
         authToken: process.env.SENTRY_AUTH_TOKEN,
       }),
     ],
   };
   ```

3. Ajouter à Vercel:
   ```
   SENTRY_AUTH_TOKEN=votre_token
   ```

### Filtrer les Erreurs

Dans `src/lib/sentry.ts`, modifier `beforeSend`:

```typescript
beforeSend(event, hint) {
  // Ne pas envoyer les erreurs de dev
  if (window.location.hostname === 'localhost') {
    return null;
  }

  // Filtrer par message
  const error = hint.originalException;
  if (error instanceof Error) {
    if (error.message?.includes('ChunkLoadError')) {
      // Ne pas envoyer les erreurs de chunk loading
      return null;
    }
  }

  return event;
}
```

### Performance Monitoring

Déjà configuré ! Ajustez le sample rate dans `sentry.ts`:

```typescript
// 10% des transactions en production
tracesSampleRate: 0.1,

// 100% en développement
tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
```

### Session Replay

Déjà configuré ! Pour ajuster:

```typescript
replaysSessionSampleRate: 0.1,  // 10% des sessions normales
replaysOnErrorSampleRate: 1.0,  // 100% des sessions avec erreur
```

⚠️ **Attention:** Session Replay capture l'écran de l'utilisateur. Assurez-vous:
- D'avoir le consentement utilisateur (RGPD)
- De masquer les données sensibles (déjà configuré avec `maskAllText: true`)

---

## Utilisation dans le Code

### Capturer une Exception

```typescript
import { captureException } from '@/lib/sentry';

try {
  await importLeads(file);
} catch (error) {
  captureException(error as Error, {
    filename: file.name,
    fileSize: file.size
  });
  showToast('Erreur lors de l\'import', 'error');
}
```

### Capturer un Message

```typescript
import { captureMessage } from '@/lib/sentry';

// Info
captureMessage('Export réussi avec 100 leads', 'info');

// Warning
captureMessage('LocalStorage presque plein', 'warning');

// Error
captureMessage('Impossible de se connecter à Supabase', 'error');
```

### Ajouter des Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb(
  'Lead créé',
  'lead',
  { leadId: '123', leadName: 'ACME Corp' }
);

addBreadcrumb(
  'Export CSV déclenché',
  'export',
  { leadsCount: 50, format: 'csv' }
);
```

### Définir l'Utilisateur

```typescript
import { setUser, clearUser } from '@/lib/sentry';

// Après login
setUser('user-123', 'user@example.com');

// Après logout
clearUser();
```

### Performance Monitoring

```typescript
import { startTransaction } from '@/lib/sentry';

async function importLargeFile(file: File) {
  const transaction = startTransaction('import-file', 'task');

  try {
    // Votre code
    await processFile(file);
    transaction.setStatus('ok');
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
```

---

## Dashboard Sentry

Une fois configuré, vous aurez accès à:

### Issues Tab
- Liste de toutes les erreurs
- Fréquence, nombre d'utilisateurs affectés
- Stack trace complète
- Breadcrumbs (historique des actions)

### Performance Tab
- Temps de chargement des pages
- Transactions les plus lentes
- Requêtes API les plus longues

### Replays Tab
- Vidéos des sessions avec erreurs
- Voir exactement ce que faisait l'utilisateur

### Alerts
Configurer des alertes:
- Email quand nouvelle erreur
- Slack/Discord notifications
- Spike detection (pic soudain d'erreurs)

---

## Quotas et Limites

### Plan Gratuit
- ✅ 10,000 erreurs/mois
- ✅ 1 membre d'équipe
- ✅ 30 jours de rétention
- ✅ Performance monitoring (10,000 transactions)
- ✅ Session Replay (50 replays)

### Plan Team ($26/mois)
- 50,000 erreurs/mois
- 10 membres d'équipe
- 90 jours de rétention
- Plus de replays et transactions

### Optimiser l'Usage

Pour ne pas dépasser les quotas:

1. **Filtrer les erreurs non importantes**
   ```typescript
   beforeSend(event) {
     if (event.message?.includes('Non-Error')) {
       return null;
     }
     return event;
   }
   ```

2. **Réduire le sample rate**
   ```typescript
   tracesSampleRate: 0.05,  // 5% au lieu de 10%
   ```

3. **Grouper les erreurs similaires**
   - Sentry le fait automatiquement
   - Une erreur répétée 1000 fois = 1 issue

---

## Troubleshooting

### Erreurs ne s'affichent pas dans Sentry

1. Vérifier que le DSN est correct dans `.env`
2. Vérifier dans la console:
   ```javascript
   console.log(import.meta.env.VITE_SENTRY_DSN);
   ```
3. Vérifier que Sentry est initialisé:
   ```javascript
   import * as Sentry from '@sentry/react';
   console.log('Sentry client:', Sentry.getClient());
   ```

### Trop d'erreurs envoyées

Ajuster `beforeSend` pour filtrer plus agressivement.

### Session Replay ne fonctionne pas

1. Vérifier que le plan inclut Session Replay
2. Vérifier le sample rate: `replaysSessionSampleRate`
3. Tester avec `replaysOnErrorSampleRate: 1.0`

---

## Sécurité & RGPD

### Données Sensibles

Sentry est configuré pour **masquer automatiquement**:
- ✅ Tout le texte (`maskAllText: true`)
- ✅ Tous les médias (`blockAllMedia: true`)

### Conformité RGPD

1. **Informer les utilisateurs** dans votre politique de confidentialité
2. **Obtenir le consentement** si Session Replay activé
3. **Permettre l'opt-out**:
   ```typescript
   if (!userConsent) {
     // Ne pas initialiser Sentry
     return;
   }
   ```

### Supprimer les Données Utilisateur

Sur demande utilisateur:
1. Aller dans Sentry > Settings > Privacy
2. Data Scrubbing Rules
3. Ajouter règle pour l'email/ID utilisateur

---

## Ressources

- 📖 [Documentation Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- 🎥 [Vidéo: Getting Started](https://www.youtube.com/watch?v=videoid)
- 💬 [Discord Sentry](https://discord.gg/sentry)
- 🐛 [Status Page](https://status.sentry.io/)

---

## Coût Estimé

Pour une application avec **1000 utilisateurs actifs/mois**:

- Erreurs: ~5,000/mois → **Plan gratuit** ✅
- Performance: ~10,000 transactions/mois → **Plan gratuit** ✅
- Session Replay: ~100 replays/mois → **Plan gratuit** ✅

**Total: 0€/mois** (dans la limite du plan gratuit)

---

## Désactiver Sentry

Si vous ne souhaitez pas utiliser Sentry:

1. Supprimer la ligne dans `.env`:
   ```env
   # VITE_SENTRY_DSN=...
   ```

2. Sentry ne s'initialisera pas automatiquement

3. (Optionnel) Désinstaller:
   ```bash
   npm uninstall @sentry/react
   ```

---

**Configuration recommandée:** ✅ Activée en production, ⚠️ Désactivée en développement local
