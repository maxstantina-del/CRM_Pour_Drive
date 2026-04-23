/**
 * Format a raw phone input into the canonical French style with spaces.
 * "0450371234" → "04 50 37 12 34". Preserves a leading + for international
 * numbers: "+33450371234" → "+33 45 03 71 23 4".
 */
export function formatFrenchPhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '').slice(0, hasPlus ? 13 : 10);
  if (hasPlus && digits.length > 0) {
    const cc = digits.slice(0, 2);
    const rest = digits.slice(2);
    const pairs = rest.match(/.{1,2}/g) ?? [];
    return `+${cc}${pairs.length ? ' ' + pairs.join(' ') : ''}`;
  }
  return digits.match(/.{1,2}/g)?.join(' ') ?? '';
}
