/**
 * Générateur de réponses intelligentes pour l'assistant IA
 * Analyse les questions et fournit des réponses contextuelles sur le CRM
 */

import CRM_SYSTEM_PROMPT from '../config/aiSystemPrompt';

interface QuestionPattern {
  keywords: string[];
  response: string;
  category: 'usage' | 'features' | 'troubleshooting' | 'best-practices';
}

const KNOWLEDGE_BASE: QuestionPattern[] = [
  // Questions pour débutants complets
  {
    keywords: ['débuter', 'commencer', 'démarrer', 'premiers pas', 'guide', 'tutoriel', 'apprendre', 'utiliser le crm'],
    category: 'usage',
    response: `Bienvenue sur CRM Bolt! Voici comment démarrer:

**🎯 Les 3 premières choses à faire:**

1. **Créez votre premier lead**
   - Cliquez sur "Nouveau Lead" en haut à droite
   - Remplissez au minimum le nom du projet
   - Validez!

2. **Explorez le Pipeline**
   - Cliquez sur "Pipeline" dans le menu à gauche
   - Vous verrez vos leads organisés par étapes
   - Essayez de glisser-déposer un lead vers une autre étape!

3. **Découvrez le Dashboard**
   - Cliquez sur "Dashboard" pour voir vos statistiques
   - Vous aurez une vue d'ensemble de vos performances

**💡 Besoin d'aide?**
Posez-moi des questions comme:
- "Comment ajouter un lead?"
- "C'est quoi un pipeline?"
- "Comment exporter mes données?"

Je suis là pour vous guider! 😊`,
  },

  // Questions sur comment ça fonctionne
  {
    keywords: ['comment ça marche', 'comment ça fonctionne', 'comment fonctionne', 'fonctionnement', 'principe'],
    category: 'features',
    response: `Voici comment fonctionne le CRM Bolt:

**🎯 Concept de Base**
Le CRM Bolt organise vos clients potentiels (leads) dans un processus de vente visuel.

**📊 Le Processus:**
1. **Vous ajoutez un lead** (un prospect/client potentiel)
2. **Le lead commence dans "Nouveau"**
3. **Vous le déplacez** au fur et à mesure qu'il progresse: Contacté → RDV → Proposition → Gagné
4. **Vous suivez** toutes vos opportunités en un coup d'œil

**🎨 Les Vues:**
- **Pipeline**: Vue visuelle en colonnes (comme un tableau Kanban)
- **Tableau**: Liste complète de tous vos leads
- **Dashboard**: Vos statistiques et performances
- **Aujourd'hui**: Vos actions urgentes

**💪 En Pratique:**
Imaginez que vous êtes commercial. Chaque carte = un client potentiel. Vous glissez la carte vers la droite quand le deal avance. Simple et efficace!

Des questions sur un aspect spécifique?`,
  },

  // Questions "C'est quoi?"
  {
    keywords: ['c\'est quoi', 'qu\'est-ce', 'définition', 'signifie', 'veut dire'],
    category: 'features',
    response: `Laissez-moi vous expliquer les concepts clés du CRM:

**🎯 Lead (Prospect)**
Un lead, c'est un client potentiel. Il contient toutes les infos de contact (nom, email, téléphone, entreprise, etc.)

**📊 Pipeline**
C'est comme un tableau qui organise vos leads selon leur progression dans le processus de vente. Par exemple: Nouveau → Contacté → RDV → Proposition → Gagné.

**📍 Étape (Stage)**
C'est une colonne du pipeline. Chaque lead est dans une étape qui indique où il en est (nouveau, contacté, gagné, etc.)

**🎨 Dashboard**
C'est votre tableau de bord avec des statistiques: combien de leads, taux de conversion, valeur totale, etc.

Quelle notion voulez-vous que je détaille?`,
  },

  // Questions sur l'ajout de leads
  {
    keywords: ['ajouter', 'créer', 'nouveau', 'lead', 'contact', 'client', 'prospect', 'enregistrer', 'saisir', 'rentrer', 'mettre'],
    category: 'usage',
    response: `Pour ajouter un nouveau lead, c'est très simple:

1. **Cliquez sur le bouton "Nouveau Lead"** dans le header (en haut à droite)
2. **Remplissez le formulaire** :
   - Nom du projet (obligatoire)
   - Informations de contact (optionnel mais recommandé)
   - Étape initiale du pipeline
3. **Cliquez sur "Créer"**

💡 **Astuce** : Vous pouvez laisser certains champs vides et les remplir plus tard en modifiant le lead.`,
  },

  // Questions sur le déplacement de leads
  {
    keywords: ['déplacer', 'changer', 'étape', 'stage', 'drag', 'drop', 'bouger', 'transférer', 'passer', 'avancer', 'glisser'],
    category: 'usage',
    response: `Il y a 2 façons de déplacer un lead d'une étape à l'autre:

**Méthode 1 : Drag & Drop (plus rapide)** 🖱️
- Dans la vue Pipeline, glissez-déposez la carte du lead vers une autre colonne

**Méthode 2 : Via le menu**
1. Cliquez sur les 3 points (⋮) sur la carte du lead
2. Sélectionnez "Modifier"
3. Changez l'étape dans le formulaire
4. Sauvegardez

🏆 Quand un lead passe à "Gagné", des confettis apparaissent pour célébrer!`,
  },

  // Questions basiques sur la modification
  {
    keywords: ['modifier', 'éditer', 'changer', 'corriger', 'mettre à jour', 'update'],
    category: 'usage',
    response: `Pour modifier un lead existant:

**Méthode simple:**
1. **Trouvez le lead** dans la vue Pipeline ou Tableau
2. **Cliquez sur les 3 points** (⋮) en haut à droite de la carte
3. **Sélectionnez "Modifier"**
4. **Changez** les informations souhaitées
5. **Cliquez sur "Sauvegarder"**

📝 Vous pouvez modifier:
- Les informations de contact
- L'étape du lead
- Les notes
- La valeur estimée
- Les prochaines actions

💡 **Astuce**: Pour juste changer l'étape, vous pouvez aussi glisser-déposer le lead vers une autre colonne dans la vue Pipeline!`,
  },

  // Questions sur la suppression
  {
    keywords: ['supprimer', 'effacer', 'enlever', 'retirer', 'delete', 'remove'],
    category: 'usage',
    response: `Pour supprimer un lead:

1. **Trouvez le lead** que vous voulez supprimer
2. **Cliquez sur les 3 points** (⋮) sur la carte
3. **Sélectionnez "Supprimer"**
4. **Confirmez** la suppression

⚠️ **Attention**: La suppression est **irréversible**! Une fois supprimé, vous ne pouvez pas récupérer le lead (sauf si vous avez un backup).

💡 **Conseil**: Au lieu de supprimer, vous pouvez déplacer le lead vers l'étape "Perdu" pour garder l'historique!`,
  },

  // Questions sur les pipelines
  {
    keywords: ['créer un pipeline', 'nouveau pipeline', 'plusieurs pipelines', 'changer de pipeline', 'renommer pipeline', 'pipeline'],
    category: 'usage',
    response: `Les pipelines vous permettent de séparer vos leads par projet, produit ou équipe.

**Créer un nouveau pipeline** :
1. Cliquez sur le nom du pipeline actuel dans la sidebar (à gauche)
2. Sélectionnez "+ Nouveau Pipeline"
3. Entrez le nom et validez

**Changer de pipeline** :
- Cliquez sur le nom du pipeline dans la sidebar
- Sélectionnez le pipeline désiré dans la liste

**Renommer/Supprimer** :
- Utilisez le menu ⋮ à côté du nom du pipeline

💡 Vous pouvez avoir autant de pipelines que vous voulez!`,
  },

  // Questions sur l'import/export
  {
    keywords: ['import', 'export', 'csv', 'backup', 'sauvegarder', 'données', 'fichier', 'télécharger', 'charger', 'excel', 'exporter', 'importer'],
    category: 'usage',
    response: `Le CRM offre plusieurs options d'import/export:

**Import CSV** :
1. Cliquez sur "Import" dans le header
2. Sélectionnez votre fichier CSV
3. Mappez les colonnes (associez chaque colonne CSV à un champ du CRM)
4. Validez l'import

**Export CSV** :
- Cliquez sur "Export CSV" pour télécharger tous les leads du pipeline actuel
- Format compatible Excel avec séparateur point-virgule (;)

**Backup complet (JSON)** :
- Cliquez sur "Backup" pour sauvegarder TOUS vos pipelines et leads
- Recommandé de faire un backup hebdomadaire!

**Restaurer un backup** :
- Importez le fichier JSON de backup
- ⚠️ Attention : cela remplace toutes vos données actuelles!`,
  },

  // Questions sur le dashboard
  {
    keywords: ['dashboard', 'statistiques', 'stats', 'graphique', 'performance', 'tableau de bord', 'chiffres', 'analyse', 'résultats', 'voir'],
    category: 'features',
    response: `Le Dashboard vous donne une vue d'ensemble de vos performances commerciales:

📊 **Statistiques disponibles** :
- Total des leads
- Taux de conversion (leads gagnés / total)
- Valeur totale du pipeline
- Distribution par étape

📈 **Graphiques** :
- Répartition des leads par étape
- Évolution dans le temps
- Performance du pipeline

💡 **Comment y accéder** :
Cliquez sur "Dashboard" dans la sidebar (menu à gauche)

Le Dashboard se met à jour automatiquement quand vous modifiez vos leads!`,
  },

  // Questions sur la recherche
  {
    keywords: ['chercher', 'rechercher', 'trouver', 'filtrer', 'recherche', 'localiser', 'où', 'voir', 'afficher'],
    category: 'usage',
    response: `La recherche vous permet de trouver rapidement un lead:

**Barre de recherche** (dans le header) :
- Recherche en temps réel dans :
  - Nom du lead
  - Email
  - Nom de l'entreprise
  - Nom du contact

**Filtres avancés** (vue Tableau) :
1. Allez dans la vue "Tableau"
2. Utilisez les filtres par étape
3. Triez par nom, date, valeur, etc.

💡 **Astuce** : Pour voir tous les leads d'une étape spécifique, utilisez la vue Pipeline ou les filtres du Tableau!`,
  },

  // Questions "où est" / "comment voir"
  {
    keywords: ['où voir', 'où sont', 'où trouver', 'comment voir', 'afficher mes leads', 'voir mes leads', 'liste des leads'],
    category: 'usage',
    response: `Pour voir vos leads, vous avez plusieurs options:

**📊 Vue Pipeline** (Recommandée pour débuter)
1. Cliquez sur **"Pipeline"** dans le menu à gauche
2. Vous verrez vos leads organisés en colonnes par étape
3. C'est la vue la plus visuelle et intuitive!

**📋 Vue Tableau**
1. Cliquez sur **"Tableau"** dans le menu à gauche
2. Vous aurez une liste complète de tous vos leads
3. Parfait pour trier et filtrer

**🎯 Vue Dashboard**
1. Cliquez sur **"Dashboard"** dans le menu
2. Vous verrez des statistiques globales
3. Utile pour voir vos performances

**🔍 Recherche Rapide**
- Utilisez la barre de recherche en haut à droite
- Tapez le nom du lead, l'entreprise ou l'email
- Résultats instantanés!

💡 **Astuce**: Si vous ne voyez pas certains leads, vérifiez que vous êtes sur le bon pipeline (sélecteur en haut à gauche).`,
  },

  // Questions sur la vue "Aujourd'hui"
  {
    keywords: ['aujourd\'hui', 'actions du jour', 'à faire', 'tâches', 'retard', 'urgent'],
    category: 'features',
    response: `La vue "Aujourd'hui" est votre assistant quotidien! 🗓️

**Ce qu'elle affiche** :
- ✅ Leads avec une action prévue aujourd'hui
- ⚠️ Leads avec une action en retard (en rouge)
- 📋 Tri par urgence

**Comment l'utiliser** :
1. Cliquez sur "Aujourd'hui" dans la sidebar
2. Consultez vos actions du jour
3. Cliquez sur un lead pour le traiter

💡 **Bonne pratique** :
Consultez cette vue chaque matin pour planifier votre journée et ne rien oublier!`,
  },

  // Questions sur les étapes
  {
    keywords: ['étapes', 'stages', 'nouveau', 'contacté', 'gagné', 'perdu'],
    category: 'features',
    response: `Les étapes du pipeline représentent votre processus de vente:

📍 **Étapes par défaut** :
1. **Nouveau** (bleu) - Leads fraîchement ajoutés
2. **Contacté** (jaune) - Premier contact établi
3. **RDV Planifié** (violet) - Rendez-vous programmé
4. **Proposition** (orange) - Proposition envoyée
5. **Négociation** (rose) - En négociation
6. **Gagné** (vert) - Client converti! 🏆
7. **Perdu** (rouge) - Opportunité perdue

🎉 **Célébration** :
Quand un lead passe à "Gagné", une animation de confettis apparaît!

💡 Les étapes vous aident à visualiser où se trouve chaque lead dans votre processus de vente.`,
  },

  // Questions sur les problèmes courants
  {
    keywords: ['disparu', 'perdu', 'trouve pas', 'ne vois pas', 'problème'],
    category: 'troubleshooting',
    response: `Si vous ne trouvez pas vos leads, voici les solutions:

**1. Vérifier le pipeline actif** :
   - Regardez quel pipeline est sélectionné dans la sidebar
   - Vos leads sont peut-être dans un autre pipeline

**2. Vérifier la recherche** :
   - Assurez-vous que la barre de recherche est vide
   - Une recherche active peut masquer certains leads

**3. Vérifier les filtres** (vue Tableau) :
   - Des filtres actifs peuvent cacher des leads
   - Réinitialisez les filtres

**4. Données effacées ?** :
   - Les données sont dans le localStorage du navigateur
   - Vider le cache peut les effacer
   - Restaurez un backup si vous en avez un

💡 Besoin d'aide pour un cas spécifique? Décrivez-moi le problème!`,
  },

  // Questions sur l'organisation des leads (SPÉCIFIQUE)
  {
    keywords: ['organiser mes leads', 'organisation des leads', 'structurer mes leads', 'classer mes leads', 'ranger mes leads'],
    category: 'best-practices',
    response: `Voici comment bien organiser vos leads pour être plus efficace:

**📁 Organisation par Pipelines**
- Créez un pipeline par type d'activité
  - Exemple: "Vente Produit A", "Vente Produit B", "Partenariats"
- Gardez vos pipelines actifs séparés des leads archivés

**📊 Utilisation des Étapes**
- Déplacez TOUJOURS vos leads vers la bonne étape
- Ne laissez pas de leads dans "Nouveau" trop longtemps
- Utilisez "Perdu" au lieu de supprimer (gardez l'historique)

**📝 Ajoutez des Informations Clés**
- Remplissez la **Valeur estimée** pour suivre votre CA
- Notez toujours la **Prochaine Action** et sa date
- Utilisez les **Notes** pour garder l'historique des échanges

**🎯 Priorisation**
- Mettez une date sur vos actions importantes
- Consultez la vue "Aujourd'hui" chaque matin
- Traitez d'abord les leads avec le plus de valeur

**🔍 Utilisez la Recherche**
- Ajoutez le nom de l'entreprise dans chaque lead
- Utilisez des mots-clés cohérents dans les notes
- Vous pourrez retrouver vos leads facilement

**💾 Faites des Backups Réguliers**
- Export JSON chaque semaine
- Gardez vos backups en sécurité

Quelle partie de l'organisation voulez-vous approfondir?`,
  },

  // Questions sur les bonnes pratiques
  {
    keywords: ['conseils', 'meilleures pratiques', 'optimiser', 'améliorer', 'efficace', 'productivité'],
    category: 'best-practices',
    response: `Voici mes meilleurs conseils pour utiliser efficacement le CRM:

**Organisation** 📋
- Créez des pipelines séparés pour différents produits/services
- Mettez à jour régulièrement l'étape de vos leads
- Ajoutez toujours une "Prochaine Action" avec sa date

**Suivi quotidien** 🗓️
- Consultez la vue "Aujourd'hui" chaque matin
- Traitez d'abord les actions en retard (en rouge)
- Planifiez vos actions futures

**Analyse de performance** 📊
- Utilisez le Dashboard pour suivre votre taux de conversion
- Identifiez les étapes où les leads restent bloqués
- Ajustez votre processus en conséquence

**Sécurité des données** 💾
- Faites un backup JSON chaque semaine
- Testez la restauration de vos backups
- Évitez de vider le cache du navigateur

**Productivité** ⚡
- Utilisez le drag & drop pour déplacer rapidement les leads
- Créez des actions personnalisées pour vos tâches récurrentes
- Renseignez la valeur estimée pour suivre votre chiffre d'affaires

Quel aspect souhaitez-vous approfondir?`,
  },

  // Questions générales sur le CRM
  {
    keywords: ['qu\'est-ce', 'c\'est quoi', 'fonctionnalités', 'peut faire', 'capacités'],
    category: 'features',
    response: `CRM Bolt est un système moderne de gestion de leads avec de nombreuses fonctionnalités:

**✨ Fonctionnalités principales** :

📊 **Gestion des Leads**
- Création, modification, suppression
- Informations complètes (contact, entreprise, valeur, etc.)
- Notes et actions à venir
- Code QR pour partage

🎯 **Pipelines de Vente**
- Multiples pipelines personnalisables
- Étapes configurables
- Drag & drop intuitif

📈 **Visualisations**
- Dashboard avec stats et graphiques
- Vue Pipeline (Kanban)
- Vue Tableau avec filtres
- Vue "Aujourd'hui" pour les urgences

💾 **Import/Export**
- Import CSV avec mapping automatique
- Export CSV
- Backup/Restore JSON complet

🎉 **Expérience utilisateur**
- Interface moderne et fluide
- Animations élégantes
- Célébration quand vous gagnez un lead!
- 100% local (vos données restent privées)

Comment puis-je vous aider à utiliser ces fonctionnalités?`,
  },
];

/**
 * Trouve la meilleure réponse basée sur la question de l'utilisateur
 */
export function findBestResponse(userQuestion: string): string | null {
  const lowerQuestion = userQuestion.toLowerCase().trim();

  let bestMatch: { pattern: QuestionPattern; score: number } | null = null;

  // Recherche dans la base de connaissances avec scoring amélioré
  for (const pattern of KNOWLEDGE_BASE) {
    let score = 0;
    let exactPhraseMatch = false;

    // Calculer le score de correspondance
    for (const keyword of pattern.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Correspondance exacte de phrase complète = score très élevé
      if (lowerQuestion === lowerKeyword || lowerQuestion.includes(` ${lowerKeyword} `) || lowerQuestion.startsWith(lowerKeyword + ' ') || lowerQuestion.endsWith(' ' + lowerKeyword)) {
        score += keyword.length * 10; // Bonus énorme pour correspondance exacte
        exactPhraseMatch = true;
      }
      // Correspondance partielle
      else if (lowerQuestion.includes(lowerKeyword)) {
        score += keyword.length;
      }
    }

    // Bonus supplémentaire si correspondance exacte trouvée
    if (exactPhraseMatch) {
      score += 100;
    }

    // Si ce pattern a un meilleur score, le garder
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { pattern, score };
    }
  }

  return bestMatch ? bestMatch.pattern.response : null;
}

/**
 * Génère une réponse intelligente basée sur le contexte du CRM
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  // 1. Rechercher dans la base de connaissances
  const knowledgeResponse = findBestResponse(userMessage);
  if (knowledgeResponse) {
    return knowledgeResponse;
  }

  // 2. Réponses pour les salutations
  const greetings = ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'hi'];
  if (greetings.some(g => lowerMessage.includes(g))) {
    return `Bonjour! 👋 Je suis votre assistant CRM intelligent. Je connais toutes les fonctionnalités du CRM Bolt et je suis là pour vous aider.

Vous pouvez me demander:
- Comment utiliser une fonctionnalité
- Des conseils pour optimiser vos ventes
- De l'aide pour résoudre un problème
- Des informations sur vos statistiques

Comment puis-je vous aider aujourd'hui?`;
  }

  // 3. Réponses pour les remerciements
  const thanks = ['merci', 'thank', 'parfait', 'super', 'génial', 'cool', 'top', 'excellent', 'bien'];
  if (thanks.some(t => lowerMessage.includes(t))) {
    return `Avec plaisir! 😊 N'hésitez pas si vous avez d'autres questions sur le CRM!`;
  }

  // 4. Questions d'aide générale
  const helpWords = ['aide', 'help', 'besoin', 'urgent', 'peux tu', 'peux-tu'];
  if (helpWords.some(h => lowerMessage.includes(h))) {
    return `Bien sûr, je suis là pour vous aider! 😊

**🎯 Questions fréquentes:**
• "Comment débuter?" - Pour les premiers pas
• "Comment ajouter un lead?" - Créer un nouveau contact
• "C'est quoi un pipeline?" - Comprendre les concepts
• "Comment exporter mes données?" - Sauvegarder vos infos

**💬 Posez votre question:**
Décrivez simplement ce que vous voulez faire, par exemple:
• "Je veux ajouter un client"
• "Comment voir mes statistiques?"
• "Où sont mes leads?"

Je vous guiderai étape par étape!`;
  }

  // 5. Si aucune correspondance, réponse générique avec suggestions
  return `Je suis là pour vous aider! Voici ce que je peux faire pour vous:

**🎯 Pour bien démarrer:**
• "Comment débuter avec le CRM?"
• "C'est quoi un lead?"
• "Comment ajouter un client?"

**📚 Actions courantes:**
• "Comment ajouter un lead?"
• "Comment déplacer un lead?"
• "Comment créer un pipeline?"
• "Comment exporter mes données?"

**📊 Comprendre le CRM:**
• "À quoi sert le Dashboard?"
• "Comment fonctionne le Pipeline?"
• "C'est quoi les étapes?"

**💡 Optimiser votre travail:**
• "Quelles sont les meilleures pratiques?"
• "Comment organiser mes leads?"
• "Astuces pour être plus efficace?"

**🔧 Résoudre un problème:**
• "Je ne trouve plus mes leads"
• "L'import ne marche pas"

N'hésitez pas à reformuler votre question de manière simple, par exemple: "comment faire pour..." ou "c'est quoi..."`;
}

/**
 * Obtient le prompt système complet
 */
export function getSystemPrompt(): string {
  return CRM_SYSTEM_PROMPT;
}
