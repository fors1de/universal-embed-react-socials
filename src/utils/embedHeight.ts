export const MIN_EMBED_HEIGHT = 50;
export const MAX_EMBED_HEIGHT = 20000;
/** Ignore these provider placeholders this many times before treating them as real content. */
export const STUB_HEIGHT_SKIP_LIMIT = 2;

/** Providers often report these placeholder heights before the real content settles. */
export const isStubEmbedHeight = (height: number): boolean =>
  height === 1500 || height === 2000;

export const clampEmbedHeight = (height: number): number | undefined => {
  const rounded = Math.round(height);
  if (rounded < MIN_EMBED_HEIGHT || rounded > MAX_EMBED_HEIGHT) {
    return undefined;
  }
  return rounded;
};

/** Skip initial 1500/2000 placeholder sizes; accept them once they persist. */
export const takeMeasuredHeight = (
  next: number | undefined,
  stubSkips: { current: number },
): number | undefined => {
  if (next == null) {
    return undefined;
  }
  if (isStubEmbedHeight(next) && stubSkips.current < STUB_HEIGHT_SKIP_LIMIT) {
    stubSkips.current += 1;
    return undefined;
  }
  stubSkips.current = 0;
  return next;
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
      const match = trimmed.match(
        /(?:iframe_height|iframeHeight|frameHeight|scrollHeight|height)["'\s:=]+(\d{2,5})/i,
      );
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
