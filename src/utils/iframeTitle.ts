import { parseUrl } from './parseUrl';

const lastPathSegment = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }
  const segs = parseUrl(url)?.pathname.split('/').filter(Boolean);
  return segs?.[segs.length - 1];
};

/** Accessible iframe name. Unique per post/video when `id` or `url` is available. */
export const embedIframeTitle = (
  provider: string,
  options?: { title?: string; url?: string; id?: string },
): string => {
  if (options?.title) {
    return options.title;
  }
  const detail = options?.id || lastPathSegment(options?.url);
  return detail ? `${provider} embed ${detail}` : `${provider} embed`;
};
