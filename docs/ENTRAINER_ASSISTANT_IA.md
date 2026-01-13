# Guide : Former l'Assistant IA sur Votre CRM

## Pourquoi Former l'Assistant?

L'assistant IA utilise une **base de connaissances** pré-configurée. Pour qu'il réponde mieux à VOS questions et comprenne VOTRE façon de parler, vous pouvez l'enrichir facilement!

## Comment Ça Marche?

L'assistant fonctionne avec un **système de patterns** (modèles de questions/réponses):

```typescript
{
  keywords: ['mots-clés', 'de', 'la', 'question'],
  category: 'usage',
  response: `Réponse détaillée ici...`
}
```

### Exemple Concret

**Question utilisateur**: "Comment organiser mes leads?"

**Pattern correspondant**:
```typescript
{
  keywords: ['organiser mes leads', 'organisation des leads'],
  response: `Voici comment organiser vos leads...`
}
```

## 🎓 Ajouter Vos Propres Questions/Réponses

### Étape 1: Ouvrir le Fichier

Ouvrez: `src/utils/aiResponseGenerator.ts`

### Étape 2: Trouver la Section KNOWLEDGE_BASE

Cherchez cette ligne (vers la ligne 14):
```typescript
const KNOWLEDGE_BASE: QuestionPattern[] = [
```

### Étape 3: Ajouter Votre Pattern

Ajoutez votre pattern **au début** de la liste (pour qu'il soit prioritaire):

```typescript
const KNOWLEDGE_BASE: QuestionPattern[] = [
  // VOTRE NOUVEAU PATTERN ICI
  {
    keywords: ['votre', 'question', 'spécifique'],
    category: 'usage',
    response: `Votre réponse personnalisée ici...`
  },

  // Les patterns existants continuent...
  {
    keywords: ['débuter', 'commencer'...
```

## 📝 Exemples Pratiques

### Exemple 1: Question Spécifique à Votre Métier

Si vous êtes dans l'immobilier et qu'on vous pose souvent "Comment gérer les visites?":

```typescript
{
  keywords: ['gérer les visites', 'organiser les visites', 'planifier visites'],
  category: 'usage',
  response: `Pour gérer vos visites immobilières dans le CRM:

1. **Créez le lead** avec les infos du bien
2. **Utilisez l'étape "RDV Planifié"** quand une visite est fixée
3. **Remplissez "Prochaine Action"** avec "Visite" et la date
4. **Consultez "Aujourd'hui"** pour voir vos visites du jour

💡 **Astuce**: Mettez l'adresse du bien dans le champ "Adresse" pour la retrouver facilement!`
},
```

### Exemple 2: Raccourci Interne

Si votre équipe utilise des termes spécifiques:

```typescript
{
  keywords: ['créer un dossier', 'nouveau dossier'],
  category: 'usage',
  response: `Pour créer un nouveau dossier client:

1. Cliquez sur "Nouveau Lead" (le bouton en haut à droite)
2. Remplissez le formulaire avec:
   - Nom du projet = Nom de votre dossier
   - Toutes les infos client
3. Validez

Note: Dans notre CRM, un "dossier" = un "lead" 😊`
},
```

### Exemple 3: Process Métier Spécifique

Si vous avez un process particulier:

```typescript
{
  keywords: ['comment suivre un devis', 'suivi de devis', 'gérer les devis'],
  category: 'usage',
  response: `Voici notre process de suivi de devis:

**Étape 1: Devis Envoyé**
- Déplacez le lead vers "Proposition"
- Notez la date d'envoi dans les notes
- Mettez "Prochaine Action": "Relance devis" dans 3 jours

**Étape 2: Suivi**
- Consultez "Aujourd'hui" pour vos relances
- Quand le client répond, passez en "Négociation"

**Étape 3: Finalisation**
- Devis accepté → "Gagné" 🎉
- Devis refusé → "Perdu" (gardez l'historique)

💡 Astuce: Mettez le montant du devis dans "Valeur estimée" pour suivre votre CA!`
},
```

## 🎯 Bonnes Pratiques

### 1. Utilisez des Phrases Complètes dans les Keywords

**❌ Mauvais:**
```typescript
keywords: ['devis', 'suivi']
```

**✅ Bon:**
```typescript
keywords: ['comment suivre un devis', 'suivi de devis', 'gérer les devis']
```

### 2. Ajoutez Plusieurs Variations

Les utilisateurs peuvent poser la même question de différentes façons:

```typescript
keywords: [
  'comment organiser mes leads',
  'organiser mes leads',
  'organisation des leads',
  'structurer mes leads',
  'classer mes leads',
  'ranger mes leads'
]
```

### 3. Soyez Spécifique

Plus votre phrase-clé est précise, mieux c'est:

**❌ Trop vague:**
```typescript
keywords: ['organiser', 'pipeline']
// Risque de matcher n'importe quelle question avec ces mots
```

**✅ Précis:**
```typescript
keywords: ['organiser mes leads', 'organisation des leads']
// Matchera uniquement les questions pertinentes
```

### 4. Catégorisez Correctement

- **`usage`**: Comment faire quelque chose
- **`features`**: Explication d'une fonctionnalité
- **`troubleshooting`**: Résolution de problème
- **`best-practices`**: Conseils et optimisation

### 5. Rédigez des Réponses Claires

Structure recommandée:
```markdown
**Introduction courte**
Expliquez en 1 phrase ce qu'on va faire

**Étapes:**
1. Première action
2. Deuxième action
3. Etc.

**Notes/Astuces:**
💡 Un conseil pratique

❓ Question de suivi?
```

## 🔧 Système de Scoring

L'assistant utilise un système de **scoring** pour trouver la meilleure réponse:

### Comment ça fonctionne?

1. **Correspondance exacte de phrase**: Score x10 + bonus de 100
   - Question: "comment organiser mes leads"
   - Keyword: "organiser mes leads"
   - → Score très élevé ✅

2. **Correspondance partielle**: Score x1
   - Question: "comment faire pour organiser"
   - Keyword: "organiser"
   - → Score plus faible

3. **Meilleure correspondance gagne**
   - L'assistant choisit le pattern avec le score le plus élevé

### Pourquoi C'est Important?

Cela évite les faux positifs! Par exemple:

**Question**: "Comment organiser mes leads?"

**Pattern 1** (spécifique):
```typescript
keywords: ['organiser mes leads']
score: 200+ → GAGNANT ✅
```

**Pattern 2** (vague):
```typescript
keywords: ['pipeline', 'organiser']
score: 10
```

## 📊 Tester Vos Modifications

### 1. Sauvegardez le Fichier
Ctrl+S sur `aiResponseGenerator.ts`

### 2. Rechargez l'Application
Ctrl+R dans le navigateur

### 3. Testez la Question
Posez la question dans le chat pour vérifier la réponse

### 4. Affinez si Nécessaire
- Pas la bonne réponse? Ajoutez plus de variations de keywords
- Mauvaise réponse? Vérifiez les conflits avec d'autres patterns

## 🎨 Exemples Complets par Secteur

### Secteur: Immobilier

```typescript
{
  keywords: ['comment gérer les biens', 'ajouter un bien', 'nouveau bien'],
  category: 'usage',
  response: `Pour ajouter un bien immobilier:

1. Cliquez sur "Nouveau Lead"
2. Remplissez:
   - **Nom du projet**: Type de bien (ex: "Maison Bordeaux")
   - **Entreprise**: Propriétaire
   - **Adresse**: Adresse complète du bien
   - **Notes**: Caractéristiques (surface, chambres, etc.)
   - **Valeur estimée**: Prix de vente
3. Créez!

💡 Utilisez les pipelines pour séparer "Vente" et "Location"!`
},
```

### Secteur: Service B2B

```typescript
{
  keywords: ['comment gérer un projet client', 'nouveau projet', 'créer projet'],
  category: 'usage',
  response: `Pour créer un nouveau projet client:

1. **Créez le lead** avec le nom du projet
2. **Remplissez les infos client**:
   - Contact principal
   - Entreprise
   - SIRET (important pour la facturation)
3. **Définissez la valeur estimée** (montant du projet)
4. **Ajoutez dans les notes**:
   - Périmètre du projet
   - Deadline
   - Besoins spécifiques

📊 Suivez l'avancement via les étapes du pipeline!`
},
```

### Secteur: E-commerce

```typescript
{
  keywords: ['gérer les commandes', 'suivi commande', 'commande client'],
  category: 'usage',
  response: `Pour suivre une commande client dans le CRM:

1. **Créez le lead** quand la commande arrive
2. **Utilisez les étapes**:
   - "Nouveau" = Commande reçue
   - "Contacté" = Confirmation envoyée
   - "RDV Planifié" = En préparation
   - "Proposition" = Expédiée
   - "Gagné" = Livrée ✅

3. **Notez le n° de commande** dans les notes

💡 Mettez le montant de la commande dans "Valeur estimée"!`
},
```

## 🚀 Aller Plus Loin

### Créer des Raccourcis pour Votre Équipe

Si votre équipe utilise des termes spécifiques, créez des aliases:

```typescript
{
  keywords: ['créer un ops', 'nouveau ops', 'ops'],
  category: 'usage',
  response: `Pour créer un nouveau "OPS" (Opportunité de Vente):

C'est simple, c'est la même chose qu'un lead! 😊

1. Cliquez sur "Nouveau Lead"
2. Remplissez les infos
3. Validez

Note: Dans notre CRM, "OPS" = "Lead" = "Opportunité"!`
},
```

### Répondre aux Questions Métier

Ajoutez des réponses sur VOTRE processus de vente:

```typescript
{
  keywords: ['notre process de vente', 'étapes de vente', 'cycle de vente'],
  category: 'best-practices',
  response: `Notre processus de vente en 5 étapes:

**1. Prospection** (Étape "Nouveau")
- Lead entrant ou prospection sortante
- Qualification initiale

**2. Premier Contact** (Étape "Contacté")
- Appel de découverte
- Compréhension des besoins

**3. Démonstration** (Étape "RDV Planifié")
- Présentation produit
- Démo personnalisée

**4. Proposition** (Étape "Proposition")
- Envoi du devis
- Réponse aux objections

**5. Closing** (Étape "Négociation" → "Gagné")
- Négociation finale
- Signature du contrat

💡 Suivez ce process dans le CRM en déplaçant vos leads d'étape en étape!`
},
```

## 📝 Template Vierge

Copiez-collez ce template pour créer vos propres réponses:

```typescript
{
  keywords: [
    'votre question principale',
    'variation 1 de la question',
    'variation 2 de la question',
  ],
  category: 'usage', // ou 'features', 'troubleshooting', 'best-practices'
  response: `Votre réponse ici:

**Section 1:**
- Point 1
- Point 2

**Section 2:**
1. Étape 1
2. Étape 2

💡 **Astuce**: Votre conseil pratique

Autre information?`
},
```

## 🎯 Checklist Avant d'Ajouter une Réponse

- [ ] J'ai identifié une question fréquente
- [ ] J'ai listé toutes les variations de la question
- [ ] J'ai rédigé une réponse claire et structurée
- [ ] J'ai testé dans le chat
- [ ] La réponse s'affiche correctement
- [ ] Il n'y a pas de conflit avec d'autres patterns

## 🆘 Problèmes Courants

### Problème 1: L'Assistant Ne Trouve Pas Ma Réponse

**Solution**: Ajoutez plus de variations de keywords
```typescript
// Au lieu de:
keywords: ['ma question']

// Faites:
keywords: [
  'ma question',
  'comment faire ma question',
  'ma question précise',
  'variation de ma question'
]
```

### Problème 2: Mauvaise Réponse Retournée

**Solution**: Vos keywords sont trop vagues. Soyez plus spécifique:
```typescript
// Au lieu de:
keywords: ['lead', 'organiser']

// Faites:
keywords: ['organiser mes leads', 'organisation des leads']
```

### Problème 3: Conflit avec un Pattern Existant

**Solution**: Placez votre pattern AVANT celui qui pose problème dans la liste, et utilisez des phrases complètes dans les keywords.

## 📞 Support

Si vous avez des questions sur comment former l'assistant:
1. Consultez cette documentation
2. Examinez les patterns existants dans `aiResponseGenerator.ts`
3. Testez progressivement vos modifications

---

**Créé le**: 14 Décembre 2025
**Version**: 1.0
**Pour**: Formation et personnalisation de l'assistant IA
