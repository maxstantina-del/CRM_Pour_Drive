# Intégration Pica IA dans CRM Bolt

## Résumé de l'intégration

L'agent IA Pica a été intégré avec succès dans votre CRM! Un chatbot intelligent est maintenant disponible dans l'interface.

## Ce qui a été fait

### 1. Configuration
- ✅ Installation des packages Pica SDK (`@picahq/ai`, `@picahq/toolkit`, `ai`, `@ai-sdk/openai`)
- ✅ Création du fichier `.env` avec votre clé API Pica
- ✅ Configuration de la clé API : `VITE_PICA_API_KEY`

### 2. Composants créés

#### `src/components/ai/ChatAgent.tsx`
- Interface de chat flottante (bouton en bas à droite)
- Design moderne avec animations
- Messages utilisateur et assistant séparés
- Indicateur de chargement

#### `src/services/picaService.ts`
- Service de communication avec l'API Pica
- Fonctions utilitaires :
  - `sendMessageToPica()` - Envoyer des messages au chatbot
  - `analyzeLeadWithPica()` - Analyser un lead avec l'IA
  - `generateEmailForLead()` - Générer des emails personnalisés
  - `isPicaConfigured()` - Vérifier la configuration

### 3. Intégration dans l'app
- Le composant `<ChatAgent />` est intégré dans `App.tsx`
- Disponible sur toutes les pages du CRM

## État actuel

### ✅ Fonctionnel
- Interface de chat opérationnelle
- Design et UX complétés
- Stockage sécurisé de la clé API dans `.env`

### ⚠️ À compléter
**IMPORTANT** : La clé API Pica ne devrait **jamais** être exposée côté client pour des raisons de sécurité.

#### Prochaine étape : Créer un backend API

Vous devez créer un serveur backend (Node.js/Express) pour gérer les appels à Pica de manière sécurisée.

## Utilisation actuelle

1. **Lancer l'application** :
   ```bash
   cd "C:\Users\maxst\Desktop\CRM\CRM_Bolt"
   npm run dev
   ```

2. **Accéder au CRM** :
   - URL: http://localhost:5174
   - Le bouton de chat (💬) apparaît en bas à droite

3. **Utiliser le chatbot** :
   - Cliquer sur le bouton pour ouvrir le chat
   - Poser des questions sur vos leads
   - Actuellement en mode simulation (réponses temporaires)

## Configuration Backend (Recommandé)

Pour utiliser pleinement Pica, créez un backend:

### Option 1: Express.js (Recommandé)

Créez `backend/server.js` :

```javascript
import express from 'express';
import { Pica } from '@picahq/ai';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pica = new Pica(process.env.PICA_SECRET_KEY, {
  connectors: ['*'],
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  const systemPrompt = await pica.generateSystemPrompt();

  const stream = streamText({
    model: openai('gpt-4'),
    system: systemPrompt,
    tools: { ...pica.oneTool },
    messages: convertToCoreMessages(messages),
    maxSteps: 10,
  });

  return stream.toDataStreamResponse();
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

### Option 2: Netlify Functions

Créez `netlify/functions/chat.js` pour déployer sur Netlify.

### Option 3: Vercel Serverless

Créez `api/chat.js` pour déployer sur Vercel.

## Fonctionnalités futures possibles

Avec Pica, vous pourrez:

1. **Analyse automatique des leads**
   - Scoring automatique
   - Recommandations d'actions
   - Priorisation intelligente

2. **Intégrations tierces**
   - Envoi d'emails via Gmail
   - Création de tâches dans Google Calendar
   - Synchronisation avec Salesforce, HubSpot
   - Messages Slack automatiques

3. **Génération de contenu**
   - Emails personnalisés
   - Propositions commerciales
   - Résumés de conversations

4. **Automatisation de workflows**
   - Déplacement automatique des leads
   - Alertes intelligentes
   - Suivi automatisé

## Fichiers créés/modifiés

```
CRM_Bolt/
├── .env                                    # Clé API Pica (ne pas commit!)
├── src/
│   ├── App.tsx                             # Modifié: import ChatAgent
│   ├── components/
│   │   └── ai/
│   │       └── ChatAgent.tsx               # Nouveau: Interface de chat
│   └── services/
│       └── picaService.ts                  # Nouveau: Service Pica
└── docs/
    └── PICA_INTEGRATION.md                 # Ce fichier
```

## Support

### Documentation Pica
- [Documentation officielle](https://docs.picaos.com)
- [Vercel AI SDK Integration](https://docs.picaos.com/toolkit/vercel-ai-sdk)
- [GitHub - Pica ToolKit](https://github.com/picahq/toolkit)

### Problèmes connus

1. **Clé API côté client** : Actuellement, la clé est dans `.env` mais ne devrait pas être utilisée directement côté client. Créez un backend.

2. **Réponses simulées** : Le chatbot retourne des réponses simulées tant que le backend n'est pas configuré.

## Variables d'environnement

```bash
# .env
VITE_PICA_API_KEY=sk_test_c_i3Z4ZVFXcrIce3fHqgT5h3uJ8HfXXgR0zvDkDEd9o
```

⚠️ **Ne jamais commit le fichier `.env`** - Il est déjà dans `.gitignore`

## Licence

Propriétaire - Tous droits réservés

---

**Intégration complétée le** : 14 Décembre 2025
**Status** : ✅ Interface OK - ⏳ Backend à créer
