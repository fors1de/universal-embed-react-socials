export const DEFAULT_FACEBOOK_API_VERSION = 'v26.0';
export const DEFAULT_INSTAGRAM_API_VERSION = '14';
export const DEFAULT_FACEBOOK_LOCALE = 'en_US';

/** Unrecognised values fall back to `DEFAULT_FACEBOOK_API_VERSION`. */
export const normalizeFacebookApiVersion = (version: string = DEFAULT_FACEBOOK_API_VERSION): string => {
  const trimmed = version.trim();
  if (/^v\d+\.\d+$/.test(trimmed)) {
    return trimmed;
  }
  if (/^v\d+$/.test(trimmed)) {
    return `${trimmed}.0`;
  }
  if (/^\d+\.\d+$/.test(trimmed)) {
    return `v${trimmed}`;
  }
  if (/^\d+$/.test(trimmed)) {
    return `v${trimmed}.0`;
  }
  return DEFAULT_FACEBOOK_API_VERSION;
};

export const normalizeInstagramApiVersion = (
  version: string = DEFAULT_INSTAGRAM_API_VERSION,
): string => version.trim().replace(/^v/i, '');

export const getFacebookSdkSrc = (
  apiVersion: string = DEFAULT_FACEBOOK_API_VERSION,
  locale: string = DEFAULT_FACEBOOK_LOCALE,
): string =>
  `https://connect.facebook.net/${locale}/sdk.js#xfbml=1&version=${normalizeFacebookApiVersion(apiVersion)}`;
