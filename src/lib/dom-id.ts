export function toZdpDomId(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized ? encodeURIComponent(normalized) : fallback;
}
