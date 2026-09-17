import { getQueryParam, parseUrl } from './parseUrl';

const pathSegments = (pathname: string): string[] => pathname.split('/').filter(Boolean);

const segmentAfter = (segments: string[], names: readonly string[]): string | undefined => {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const index = segments.findIndex((segment) => wanted.has(segment.toLowerCase()));
  const next = index >= 0 ? segments[index + 1] : undefined;
  return next || undefined;
};

export const getYouTubeVideoId = (url: string): string | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./i, '');
  const segs = pathSegments(parsed.pathname);
  if (host === 'youtu.be') {
    return segs[0] || undefined;
  }
  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    const fromQuery = getQueryParam(parsed.search, 'v');
    if (fromQuery) {
      return fromQuery;
    }
    return segmentAfter(segs, ['embed', 'shorts', 'live', 'v']);
  }
  return undefined;
};

const parseYouTubeTimestamp = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match || match[0] === '') {
    return 0;
  }
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
};

/** Seconds from `start=` or `t=` (`90`, `90s`, `1m30s`). */
export const getYouTubeStart = (url: string): number => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return 0;
  }
  const start = parseYouTubeTimestamp(getQueryParam(parsed.search, 'start'));
  if (start > 0) {
    return start;
  }
  return parseYouTubeTimestamp(getQueryParam(parsed.search, 't'));
};

export const getXPostId = (url: string): string | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  return segmentAfter(pathSegments(parsed.pathname), ['status']);
};

export const getTikTokVideoId = (url: string): string | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  return segmentAfter(pathSegments(parsed.pathname), ['video', 'photo']);
};

export const getPinterestPinId = (url: string): string | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  return segmentAfter(pathSegments(parsed.pathname), ['pin']);
};

export const getCleanInstagramUrl = (url: string): string | undefined => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  const segs = pathSegments(parsed.pathname);
  const kindIndex = segs.findIndex((segment) => ['p', 'reel', 'reels', 'tv'].includes(segment.toLowerCase()));
  const code = kindIndex >= 0 ? segs[kindIndex + 1] : undefined;
  if (!code) {
    return undefined;
  }
  const kind = segs[kindIndex].toLowerCase() === 'reels' ? 'reel' : segs[kindIndex].toLowerCase();
  return `${parsed.origin}/${kind}/${code}/`;
};

export const escapeHtmlAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const isJavaScriptUrl = (url: string): boolean =>
  /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i.test(
    url,
  );
