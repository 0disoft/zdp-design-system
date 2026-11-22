export function toZdpDomId(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized ? toZdpDomKey(normalized) : fallback;
}

export function normalizeIdRefs(value: string | readonly string[] | null): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value.trim() || null;

  const normalized = value.map((entry) => entry.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized.join(' ') : null;
}

/** Lossless item identity: preserve whitespace, empty keys, and lone surrogates. */
export function toZdpDomKey(value: string): string {
  if (!value.length) return '%empty';
  let encoded = '';
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff) {
      index += 1;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      encoded += encodeURIComponent(value.slice(start, index)) + `%u${code.toString(16).padStart(4, '0')}`;
      start = index + 1;
    }
  }
  return encoded + encodeURIComponent(value.slice(start));
}
