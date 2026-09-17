export const MIN_EMBED_HEIGHT = 50;
export const MAX_EMBED_HEIGHT = 4000;

/** Providers report a placeholder height before the real content settles. */
export const isStubEmbedHeight = (height: number): boolean =>
  height === 1500 || height === 2000;

export const clampEmbedHeight = (height: number): number | undefined => {
  const rounded = Math.round(height);
  if (
    rounded < MIN_EMBED_HEIGHT ||
    rounded > MAX_EMBED_HEIGHT ||
    isStubEmbedHeight(rounded)
  ) {
    return undefined;
  }
  return rounded;
};

/** Parse a height out of a provider postMessage payload. Same on web and native. */
export const parseEmbedHeight = (data: unknown, depth = 0): number | undefined => {
  if (depth > 4 || data == null) {
    return undefined;
  }
  if (typeof data === 'number') {
    return clampEmbedHeight(data);
  }
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      return parseEmbedHeight(JSON.parse(trimmed), depth + 1);
    } catch {
      const match = trimmed.match(/(?:height|frameHeight|scrollHeight|h)["'\s:=]+(\d{2,4})/i);
      return match ? parseEmbedHeight(Number(match[1]), depth + 1) : undefined;
    }
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const next = parseEmbedHeight(item, depth + 1);
      if (next) {
        return next;
      }
    }
    return undefined;
  }
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['height', 'frameHeight', 'iframeHeight', 'iframe_height', 'scrollHeight']) {
      const next = parseEmbedHeight(record[key], depth + 1);
      if (next) {
        return next;
      }
    }
    for (const key of ['payload', 'params', 'data', 'message', 'value']) {
      const next = parseEmbedHeight(record[key], depth + 1);
      if (next) {
        return next;
      }
    }
  }
  return undefined;
};
