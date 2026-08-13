export function toZdpDomId(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized ? encodeURIComponent(toWellFormed(normalized)) : fallback;
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
