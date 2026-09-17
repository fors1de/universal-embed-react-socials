import { getQueryParam, hrefWithoutQuery, parseUrl, type ParsedUrl } from './parseUrl';

const isTikTokHost = (host: string): boolean =>
  host === 'tiktok.com' || host.endsWith('.tiktok.com');

const nestedValueLooksLikeAppRedirect = (value: string): boolean => {
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();
  if (/^(?:tiktok|snssdk\d+):/i.test(decoded)) {
    return true;
  }
  const nested = parseUrl(decoded);
  if (!nested) {
    return /(?:tiktok|snssdk\d+):|onelink\.me/i.test(value);
  }
  return (
    /^snssdk\d+\.onelink\.me$/i.test(nested.hostname) ||
    (nested.hostname.endsWith('.tiktokv.com') && nested.pathname.startsWith('/redirect'))
  );
};

const isTikTokAppInstallRedirect = (target: ParsedUrl): boolean => {
  if (
    (target.protocol === 'https:' || target.protocol === 'http:') &&
    target.hostname.endsWith('.tiktokv.com') &&
    target.pathname.startsWith('/redirect')
  ) {
    return true;
  }

  for (const key of ['redirect_url', 'dl']) {
    const nested = getQueryParam(target.search, key);
    if (nested && nestedValueLooksLikeAppRedirect(nested)) {
      return true;
    }
  }

  return false;
};

/** Bypass app-install redirects that can leave Safari opening an unsupported app scheme. */
export const resolveTikTokBrowserUrl = (targetUrl: string, postUrl: string): string => {
  const target = parseUrl(targetUrl);
  if (!target) {
    return targetUrl;
  }
  const isAppScheme = /^(?:tiktok|snssdk\d+):$/i.test(target.protocol);
  const isWebRedirect =
    (target.protocol === 'https:' || target.protocol === 'http:') &&
    (/^snssdk\d+\.onelink\.me$/i.test(target.hostname) ||
      (isTikTokHost(target.hostname) && /^\/(?:download-link|link)(?:\/|$)/.test(target.pathname)) ||
      isTikTokAppInstallRedirect(target));
  if (!isAppScheme && !isWebRedirect) {
    return targetUrl;
  }

  const post = parseUrl(postUrl);
  if (!post || !isTikTokHost(post.hostname) || !/^https?:$/i.test(post.protocol)) {
    return targetUrl;
  }
  return hrefWithoutQuery({ ...post, protocol: 'https:' });
};
