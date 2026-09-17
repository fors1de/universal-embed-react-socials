export type ParsedUrl = {
  href: string;
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
};

const decodePart = (value: string): string => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
};

/** Query value from a `search` string (`?a=1&b=2`). Does not use `URLSearchParams`. */
export const getQueryParam = (search: string, name: string): string | undefined => {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) {
    return undefined;
  }
  for (const part of query.split('&')) {
    if (!part) {
      continue;
    }
    const eq = part.indexOf('=');
    const key = decodePart(eq === -1 ? part : part.slice(0, eq));
    if (key === name) {
      return decodePart(eq === -1 ? '' : part.slice(eq + 1));
    }
  }
  return undefined;
};

/**
 * Parse an absolute or scheme-less URL without `URL` / `URLSearchParams`.
 * React Native's built-in `URL` does not implement `searchParams` or `hostname`.
 */
export const parseUrl = (value: string): ParsedUrl | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)([\s\S]*)$/);
  if (schemeMatch && !/^https?:$/i.test(schemeMatch[1])) {
    return {
      href: trimmed,
      protocol: schemeMatch[1].toLowerCase(),
      hostname: '',
      pathname: schemeMatch[2],
      search: '',
      hash: '',
      origin: '',
    };
  }

  const input = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  const match = input.match(/^(https?):\/\/([^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i);
  if (!match) {
    return undefined;
  }
  const protocol = `${match[1].toLowerCase()}:`;
  let host = match[2];
  const at = host.lastIndexOf('@');
  if (at !== -1) {
    host = host.slice(at + 1);
  }
  const hostname = host.replace(/:\d+$/, '').toLowerCase();
  const pathname = match[3] || '/';
  const search = match[4] || '';
  const hash = match[5] || '';
  const origin = `${protocol}//${hostname}`;
  const href = `${protocol}//${match[2]}${pathname}${search}${hash}`;
  return { href, protocol, hostname, pathname, search, hash, origin };
};

export const hrefWithoutQuery = (url: ParsedUrl): string =>
  `${url.protocol}//${url.hostname}${url.pathname}`;
