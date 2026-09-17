import { getQueryParam, parseUrl } from './parseUrl';

const GENERIC_SEGMENTS = new Set([
  'watch',
  'embed',
  'p',
  'pin',
  'status',
  'video',
  'photo',
  'posts',
  'reel',
  'reels',
  'tv',
  'shorts',
  'live',
  'player',
  'v1',
  'v2',
  'feed',
  'update',
  'plugins',
]);

const detailFromUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }
  const parsed = parseUrl(url);
  if (!parsed) {
    return undefined;
  }
  const fromQuery = getQueryParam(parsed.search, 'v');
  if (fromQuery) {
    return fromQuery;
  }
  const segs = parsed.pathname.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    const seg = segs[i];
    if (!GENERIC_SEGMENTS.has(seg.toLowerCase()) && seg.length > 2) {
      return seg;
    }
  }
  return undefined;
};

/** Accessible iframe name. Unique per post/video when `id` or `url` is available. */
export const embedIframeTitle = (
  provider: string,
  options?: { title?: string; url?: string; id?: string },
): string => {
  if (options?.title) {
    return options.title;
  }
  const detail = options?.id || detailFromUrl(options?.url);
  return detail ? `${provider} embed ${detail}` : `${provider} embed`;
};
