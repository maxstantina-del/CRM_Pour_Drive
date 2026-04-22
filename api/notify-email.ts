/**
 * Email notification sender — receives Supabase Database Webhook POSTs on
 * notifications INSERT and sends an email via Resend.
 *
 * Required env vars:
 * - RESEND_API_KEY
 * - RESEND_FROM_EMAIL    e.g. "CRM ChosenMX <noreply@chosen-mx.com>"
 *
 * Optional env var:
 * - SUPABASE_WEBHOOK_SECRET  — if set, the function rejects requests that don't
 *   carry the same value in the `X-Webhook-Secret` header.
 */

export const config = { runtime: 'edge' };

interface SupabaseWebhookBody {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    user_id: string;
    kind: string;
    payload: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  };
  schema: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = req.headers.get('x-webhook-secret');
    if (got !== expectedSecret) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'CRM <onboarding@resend.dev>';
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY missing' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: SupabaseWebhookBody;
  try {
    body = (await req.json()) as SupabaseWebhookBody;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (body.type !== 'INSERT' || body.table !== 'notifications') {
    return new Response(JSON.stringify({ skipped: 'not an INSERT on notifications' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const record = body.record;
  if (!record || record.kind !== 'lead_won') {
    return new Response(JSON.stringify({ skipped: 'kind is not lead_won' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const p = record.payload ?? {};
  const recipientEmail = typeof p.recipientEmail === 'string' ? p.recipientEmail : null;
  if (!recipientEmail) {
    return new Response(JSON.stringify({ skipped: 'no recipientEmail in payload' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const leadName = escapeHtml(String(p.leadName ?? 'Un lead'));
  const pipelineName = escapeHtml(String(p.pipelineName ?? ''));
  const wonByEmail = escapeHtml(String(p.wonByEmail ?? 'Un collègue'));
  const leadId = typeof p.leadId === 'string' ? p.leadId : '';
  const appUrl = 'https://crm-pour-drive.vercel.app/';

  const html = `<!doctype html>
<html lang="fr">
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <tr>
      <td style="padding:24px;background:linear-gradient(135deg,#10B981,#059669);color:#ffffff;">
        <h1 style="margin:0;font-size:20px;">🏆 Un lead vient d'être signé</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;color:#1f2937;">
        <p style="margin:0 0 12px;font-size:15px;">Bonjour,</p>
        <p style="margin:0 0 16px;font-size:15px;">
          <strong>${leadName}</strong>${pipelineName ? ` (pipeline « ${pipelineName} »)` : ''} vient d'être passé en <strong>Gagné</strong>
          par ${wonByEmail}.
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
          Connecte-toi au CRM pour consulter la fiche complète.
        </p>
        <a href="${appUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">
          Ouvrir le CRM
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
        Tu reçois cet email car tu es partenaire sur ce pipeline.<br/>
        Lead id : ${escapeHtml(leadId)}
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `🏆 ${String(p.leadName ?? 'Lead')} est signé`,
      html,
    }),
  });

  const resText = await res.text();
  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'resend failed', status: res.status, body: resText }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ sent: true, to: recipientEmail, resend: resText }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
