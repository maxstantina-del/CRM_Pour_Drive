/**
 * Service OpenAI pour la génération d'Ice Breakers
 * Utilise la clé API de l'utilisateur (BYOK - Bring Your Own Key)
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IceBreakerContext {
  leadName: string;
  leadCompany?: string;
  leadRole?: string;
  leadWebsite?: string;
  leadLinkedIn?: string;
  userSector?: string;
  userRole?: string;
  tone: 'professional' | 'casual' | 'enthusiastic';
  customPrompt?: string;
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * Génère un ice breaker personnalisé via OpenAI
 */
export async function generateIceBreaker(
  apiKey: string,
  context: IceBreakerContext
): Promise<{ success: true; text: string } | { success: false; error: string }> {

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      error: 'Clé API manquante. Veuillez configurer votre clé OpenAI dans les paramètres.'
    };
  }

  try {
    // Construction du prompt système
    const systemPrompt = buildSystemPrompt(context);

    // Construction du prompt utilisateur
    const userPrompt = buildUserPrompt(context);

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modèle le moins cher et rapide
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Créativité modérée
        max_tokens: 300, // Limite pour garder les messages courts
        top_p: 1,
        frequency_penalty: 0.3, // Évite les répétitions
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData: OpenAIError = await response.json();

      // Gestion des erreurs spécifiques
      if (response.status === 401) {
        return {
          success: false,
          error: 'Clé API invalide. Vérifiez votre clé OpenAI dans les paramètres.'
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          error: 'Quota dépassé. Vérifiez votre limite de quota OpenAI ou attendez un peu.'
        };
      }

      if (response.status === 500) {
        return {
          success: false,
          error: 'Erreur serveur OpenAI. Réessayez dans quelques instants.'
        };
      }

      return {
        success: false,
        error: errorData.error?.message || 'Erreur lors de la génération. Réessayez.'
      };
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return {
        success: false,
        error: 'Aucune réponse générée. Réessayez.'
      };
    }

    const generatedText = data.choices[0].message.content.trim();

    return {
      success: true,
      text: generatedText
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Impossible de contacter OpenAI. Vérifiez votre connexion internet.'
      };
    }

    return {
      success: false,
      error: 'Erreur inattendue. Réessayez dans quelques instants.'
    };
  }
}

/**
 * Construit le prompt système selon le contexte
 */
function buildSystemPrompt(context: IceBreakerContext): string {
  const toneDescriptions = {
    professional: 'professionnel, respectueux et courtois',
    casual: 'décontracté, amical et accessible',
    enthusiastic: 'enthousiaste, dynamique et inspirant'
  };

  const tone = toneDescriptions[context.tone] || toneDescriptions.professional;

  return `Tu es un expert en prospection commerciale B2B et en copywriting.

Ton rôle: Générer des phrases d'accroche (ice breakers) personnalisées pour contacter des prospects.

Contexte:
- Ton secteur d'activité: ${context.userSector || 'non spécifié'}
- Ton poste: ${context.userRole || 'commercial'}
- Ton style de communication: ${tone}

Règles importantes:
1. La phrase doit faire MAXIMUM 3-4 lignes
2. Elle doit être personnalisée selon les informations du prospect
3. Évite les formules génériques ou trop commerciales
4. Crée de la curiosité ou apporte de la valeur immédiate
5. Le ton doit être ${tone}
6. NE mets PAS de signature (pas de "Cordialement", "Bien à vous", etc.)
7. Commence directement par l'accroche, sans "Bonjour" (l'utilisateur l'ajoutera)
8. Concentre-toi sur le PROSPECT et ses besoins, pas sur toi

Exemples de bonnes accroches:
- "J'ai remarqué que [Entreprise] développe actuellement [sujet]. Nous avons accompagné [autre entreprise similaire] sur un projet similaire avec des résultats impressionnants. Seriez-vous ouvert à un échange de 15 minutes?"
- "Votre article sur [sujet] m'a vraiment parlé. J'ai justement travaillé sur [cas d'usage pertinent]. J'aimerais partager quelques insights qui pourraient vous intéresser."
- "Félicitations pour [réalisation récente de l'entreprise] ! Nous aidons des entreprises comme la vôtre à [bénéfice concret]. Auriez-vous 10 minutes cette semaine?"`;
}

/**
 * Construit le prompt utilisateur avec les infos du lead
 */
function buildUserPrompt(context: IceBreakerContext): string {
  const parts: string[] = [];

  parts.push(`Génère une phrase d'accroche personnalisée pour:`);
  parts.push(`- Nom du prospect: ${context.leadName}`);

  if (context.leadCompany) {
    parts.push(`- Entreprise: ${context.leadCompany}`);
  }

  if (context.leadRole) {
    parts.push(`- Poste: ${context.leadRole}`);
  }

  if (context.leadWebsite) {
    parts.push(`- Site web: ${context.leadWebsite} (tu peux mentionner que tu l'as visité)`);
  }

  if (context.leadLinkedIn) {
    parts.push(`- LinkedIn: ${context.leadLinkedIn} (tu peux mentionner son profil)`);
  }

  // Ajout du prompt personnalisé si présent
  if (context.customPrompt && context.customPrompt.trim() !== '') {
    parts.push('');
    parts.push('Instructions supplémentaires:');
    parts.push(context.customPrompt);
  }

  parts.push('');
  parts.push('Génère maintenant une accroche courte et percutante (3-4 lignes max).');

  return parts.join('\n');
}

/**
 * Teste la validité d'une clé API OpenAI
 */
export async function testOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401) {
      return { valid: false, error: 'Clé API invalide' };
    }

    return { valid: false, error: 'Impossible de valider la clé' };
  } catch (error) {
    return { valid: false, error: 'Erreur de connexion' };
  }
}

/**
 * Estime le coût d'une génération
 */
export function estimateCost(): string {
  // GPT-4o-mini: ~$0.15 / 1M input tokens, ~$0.60 / 1M output tokens
  // Une génération ≈ 400 input tokens + 100 output tokens
  // Coût ≈ $0.0001 (0.01 centime)
  return '~0.01 centime par génération';
}
