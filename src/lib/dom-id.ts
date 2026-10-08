export function toZdpDomId(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized ? encodeURIComponent(toWellFormed(normalized)) : fallback;
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

function toWellFormed(value: string): string {
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        result += value.charAt(index) + value.charAt(index + 1);
        index += 1;
      } else {
        result += '\ufffd';
      }
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      result += '\ufffd';
    } else {
      result += value.charAt(index);
    }
  }

  return result;
}
