# Guide de l'Assistant IA CRM Bolt

## Vue d'ensemble

Votre CRM intègre maintenant un **assistant IA intelligent** qui connaît parfaitement toutes les fonctionnalités du CRM Bolt et peut vous guider dans son utilisation.

## Caractéristiques de l'Assistant

### 🧠 Connaissance Complète du CRM

L'assistant IA a été pré-prompté avec une connaissance approfondie de:
- Toutes les fonctionnalités du CRM
- Structure des données (Leads, Pipelines, Étapes)
- Processus d'utilisation étape par étape
- Meilleures pratiques et conseils
- Solutions aux problèmes courants
- Astuces de productivité

### 💬 Capacités de l'Assistant

L'assistant peut vous aider avec:

**1. Utilisation du CRM**
- Comment ajouter/modifier/supprimer un lead
- Comment créer et gérer des pipelines
- Comment importer/exporter des données
- Comment utiliser la recherche et les filtres
- Comment naviguer entre les différentes vues

**2. Fonctionnalités**
- Explication du Dashboard et des statistiques
- Guide de la vue Pipeline (Kanban)
- Utilisation de la vue Tableau
- Fonctionnement de la vue "Aujourd'hui"
- Actions personnalisées

**3. Conseils et Optimisation**
- Meilleures pratiques pour organiser vos leads
- Optimisation de votre processus de vente
- Astuces de productivité
- Analyse de performance

**4. Résolution de Problèmes**
- Leads disparus ou introuvables
- Problèmes d'import/export
- Difficultés techniques
- Questions sur le stockage des données

## Comment Utiliser l'Assistant

### Accès

1. **Ouvrir le chat**: Cliquez sur le bouton 💬 en bas à droite de l'écran
2. **Poser votre question**: Tapez votre question dans la zone de texte
3. **Envoyer**: Appuyez sur Entrée ou cliquez sur le bouton d'envoi
4. **Recevoir la réponse**: L'assistant répond en quelques secondes

### Fermer le chat

Cliquez sur le ✕ en haut à droite du chat pour le fermer.

## Exemples de Questions

### Questions sur l'utilisation

```
"Comment ajouter un nouveau lead?"
"Comment déplacer un lead vers une autre étape?"
"Comment créer un nouveau pipeline?"
"Comment exporter mes données en CSV?"
"Comment faire un backup de mes données?"
```

### Questions sur les fonctionnalités

```
"À quoi sert le Dashboard?"
"Comment fonctionne la vue Aujourd'hui?"
"Quelles sont les étapes du pipeline?"
"Comment utiliser la recherche?"
"Qu'est-ce qu'un pipeline?"
```

### Demandes de conseils

```
"Quelles sont les meilleures pratiques?"
"Comment optimiser mon processus de vente?"
"Comment bien organiser mes leads?"
"Conseils pour utiliser efficacement le CRM"
```

### Résolution de problèmes

```
"Je ne trouve plus mes leads"
"Mon import CSV ne fonctionne pas"
"Mes données ont disparu"
"Le drag and drop ne marche pas"
```

## Base de Connaissances Intégrée

L'assistant dispose d'une base de connaissances complète qui couvre:

### 1. Gestion des Leads
- Création de leads avec tous les champs disponibles
- Modification et suppression de leads
- Déplacement entre les étapes (drag & drop ou menu)
- Visualisation des détails avec QR code
- Notes et actions à venir

### 2. Gestion des Pipelines
- Création de multiples pipelines
- Renommage et suppression
- Changement de pipeline actif
- Organisation par produit/service/équipe

### 3. Import/Export
- Import CSV avec mapping des colonnes
- Export CSV des leads actuels
- Backup JSON complet
- Restauration de backup

### 4. Vues et Navigation
- **Dashboard**: Statistiques, graphiques, KPIs
- **Pipeline**: Vue Kanban avec drag & drop
- **Tableau**: Liste complète avec filtres
- **Aujourd'hui**: Actions du jour et en retard

### 5. Recherche et Filtres
- Recherche globale en temps réel
- Filtres par étape
- Tri par différents critères

### 6. Étapes du Pipeline
- Nouveau (bleu)
- Contacté (jaune)
- RDV Planifié (violet)
- Proposition (orange)
- Négociation (rose)
- Gagné (vert) 🏆 avec célébration!
- Perdu (rouge)

### 7. Meilleures Pratiques
- Organisation des leads
- Suivi quotidien
- Analyse de performance
- Sécurité des données
- Astuces de productivité

### 8. Résolution de Problèmes
- Leads introuvables
- Problèmes de pipeline
- Difficultés d'import/export
- Questions sur le stockage

## Fonctionnement Technique

### Mode Actuel: Réponses Intelligentes Pré-Configurées

L'assistant utilise actuellement un **système de réponses intelligentes** basé sur:

1. **Analyse des mots-clés**: Détecte les termes importants dans votre question
2. **Correspondance de patterns**: Trouve la meilleure réponse dans la base de connaissances
3. **Réponses contextuelles**: Fournit des instructions détaillées et pertinentes
4. **Suggestions intelligentes**: Propose des questions de suivi

### Avantages de ce mode

✅ **Rapide**: Réponses quasi-instantanées
✅ **Précis**: Réponses basées sur la documentation officielle
✅ **Fiable**: Pas de "hallucinations" IA
✅ **Privé**: Fonctionne 100% localement
✅ **Gratuit**: Pas de coûts d'API

### Évolution Vers Pica IA (Future)

Pour une expérience encore plus avancée avec:
- Analyse de vos données réelles
- Recommandations personnalisées
- Génération d'emails
- Intégrations tierces (Gmail, Calendar, etc.)

Un backend sécurisé devra être créé (voir `PICA_INTEGRATION.md`).

## Personnalisation

### Ajouter des Réponses Personnalisées

Pour ajouter vos propres réponses à la base de connaissances:

1. Ouvrez `src/utils/aiResponseGenerator.ts`
2. Ajoutez un nouvel objet dans `KNOWLEDGE_BASE`:

```typescript
{
  keywords: ['votre', 'mots-clés'],
  category: 'usage',
  response: `Votre réponse personnalisée ici...`
}
```

### Modifier le Prompt Système

Pour modifier la personnalité ou les connaissances de l'assistant:

1. Ouvrez `src/config/aiSystemPrompt.ts`
2. Modifiez `CRM_SYSTEM_PROMPT`
3. L'assistant utilisera automatiquement les nouvelles informations

## Statistiques d'Utilisation

L'assistant peut répondre à:
- ✅ **11+ catégories** de questions
- ✅ **50+ mots-clés** détectés
- ✅ **Réponses détaillées** avec instructions pas à pas
- ✅ **Suggestions contextuelles** pour approfondir

## Limites Actuelles

### Ce que l'assistant PEUT faire:
- ✅ Expliquer toutes les fonctionnalités
- ✅ Guider l'utilisateur étape par étape
- ✅ Donner des conseils et meilleures pratiques
- ✅ Résoudre les problèmes courants
- ✅ Répondre aux questions générales sur le CRM

### Ce que l'assistant NE PEUT PAS encore faire:
- ❌ Analyser vos données réelles (leads, stats)
- ❌ Effectuer des actions dans le CRM
- ❌ Générer des emails personnalisés
- ❌ Se connecter à des services tiers
- ❌ Apprendre de vos interactions

**Ces fonctionnalités nécessitent l'intégration complète avec Pica API (voir documentation PICA_INTEGRATION.md)**

## FAQ

### Q: L'assistant peut-il modifier mes leads?
**R**: Non, il est actuellement en mode lecture seule. Il guide l'utilisateur mais n'effectue pas d'actions directes.

### Q: Mes questions sont-elles envoyées à un serveur?
**R**: Non, tout fonctionne localement dans votre navigateur. Aucune donnée n'est envoyée en ligne.

### Q: Comment améliorer les réponses de l'assistant?
**R**: Posez des questions précises et utilisez les mots-clés pertinents. L'assistant apprendra à mieux vous comprendre.

### Q: L'assistant fonctionne-t-il hors ligne?
**R**: Oui! Puisqu'il utilise une base de connaissances locale, il fonctionne même sans connexion internet.

### Q: Comment ajouter plus de connaissances?
**R**: Éditez le fichier `src/utils/aiResponseGenerator.ts` pour ajouter de nouvelles questions/réponses.

## Support

Pour toute question sur l'assistant IA:
1. Consultez cette documentation
2. Examinez `src/config/aiSystemPrompt.ts` pour voir toutes les connaissances
3. Regardez `src/utils/aiResponseGenerator.ts` pour les patterns de questions

## Prochaines Évolutions

Fonctionnalités prévues pour les futures versions:

🔮 **Version 2.1**
- Analyse des statistiques réelles du CRM
- Suggestions basées sur vos données

🔮 **Version 2.2**
- Actions directes (créer lead, modifier étape)
- Intégration complète avec Pica API

🔮 **Version 2.3**
- Génération d'emails et contenus
- Intégrations tierces (Gmail, Calendar, Slack)

---

**Créé le**: 14 Décembre 2025
**Version**: 1.0 (Assistant Intelligent Pré-Prompté)
**Status**: ✅ Opérationnel et prêt à l'emploi
