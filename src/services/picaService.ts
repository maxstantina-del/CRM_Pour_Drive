/**
 * Service Pica pour l'intégration IA
 * Gère la communication avec l'API Pica et les agents IA
 */

const PICA_API_KEY = import.meta.env.VITE_PICA_API_KEY;
const PICA_API_URL = 'https://api.picaos.com/v1';

export interface PicaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PicaChatRequest {
  messages: PicaMessage[];
  connectors?: string[];
  maxSteps?: number;
}

export interface PicaChatResponse {
  message: string;
  actions?: any[];
  error?: string;
}

/**
 * Envoie un message au chatbot Pica
 */
export async function sendMessageToPica(
  messages: PicaMessage[]
): Promise<PicaChatResponse> {
  try {
    // Note: Pica nécessite typiquement un backend pour gérer les requêtes API
    // car la clé secrète ne devrait pas être exposée côté client.
    // Pour une implémentation de production, créez une route API backend.

    console.log('Messages envoyés à Pica:', messages);

    // TODO: Implémenter l'appel réel à l'API Pica via un backend
    // Pour l'instant, retour simulé
    return {
      message: "Cette fonctionnalité nécessite un backend pour sécuriser la clé API Pica. Consultez la documentation pour configurer un serveur API.",
      actions: [],
    };

    /* Exemple d'implémentation réelle (à faire côté backend):
    const response = await fetch(`${PICA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PICA_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        connectors: ['*'], // Tous les connecteurs disponibles
        maxSteps: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pica API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      message: data.choices[0]?.message?.content || 'Pas de réponse',
      actions: data.actions || [],
    };
    */
  } catch (error) {
    console.error('Erreur Pica:', error);
    return {
      message: 'Désolé, une erreur est survenue lors de la communication avec Pica.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyse un lead avec l'IA Pica
 */
export async function analyzeLeadWithPica(leadData: any): Promise<{
  insights: string;
  recommendations: string[];
  nextActions: string[];
}> {
  const messages: PicaMessage[] = [
    {
      role: 'system',
      content: 'Tu es un assistant CRM intelligent qui analyse les leads et propose des recommandations.',
    },
    {
      role: 'user',
      content: `Analyse ce lead et donne des insights et recommandations: ${JSON.stringify(leadData)}`,
    },
  ];

  const response = await sendMessageToPica(messages);

  // Parse la réponse (à adapter selon le format réel de Pica)
  return {
    insights: response.message,
    recommendations: [
      'Recommandation basée sur l\'analyse IA (à implémenter)',
    ],
    nextActions: [
      'Action suggérée par l\'IA (à implémenter)',
    ],
  };
}

/**
 * Génère un email personnalisé pour un lead
 */
export async function generateEmailForLead(
  leadData: any,
  context: string
): Promise<string> {
  const messages: PicaMessage[] = [
    {
      role: 'system',
      content: 'Tu es un expert en rédaction d\'emails commerciaux personnalisés.',
    },
    {
      role: 'user',
      content: `Génère un email professionnel pour ce lead:\n${JSON.stringify(leadData)}\n\nContexte: ${context}`,
    },
  ];

  const response = await sendMessageToPica(messages);
  return response.message;
}

/**
 * Vérifie si Pica est configuré correctement
 */
export function isPicaConfigured(): boolean {
  return !!PICA_API_KEY && PICA_API_KEY !== 'your_pica_key_here';
}
