/**
 * Proxy to Cloudflare Workers AI.
 *
 * Secret env vars (set on Vercel):
 *   CLOUDFLARE_API_TOKEN  — token with Workers AI:Edit scope
 *   CLOUDFLARE_ACCOUNT_ID — 32-char account id
 *   CLOUDFLARE_AI_MODEL   — optional, default "@cf/meta/llama-3.2-3b-instruct"
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const model = process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.2-3b-instruct';

  if (!token || !accountId) {
    return new Response(JSON.stringify({ error: 'Server AI misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages[] required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Guardrails: keep last 20 messages, cap each content at 4000 chars
  const safeMessages = body.messages
    .slice(-20)
    .map(m => ({
      role: m.role,
      content: String(m.content ?? '').slice(0, 4000),
    }));

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: safeMessages,
          max_tokens: 500,
          temperature: 0.4,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: `AI upstream ${res.status}`, detail: text.slice(0, 400) }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = (await res.json()) as { success: boolean; result?: { response?: string }; errors?: Array<{ message: string }> };

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: data.errors?.[0]?.message ?? 'AI upstream error' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ reply: data.result?.response ?? '', model }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'AI request failed', detail: String(err).slice(0, 400) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = { runtime: 'edge' };
