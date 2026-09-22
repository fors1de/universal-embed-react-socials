const systemLocale = (): string => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
};

/**
 * `data-lang` for a Twitter/X embed. Twitter takes ISO 639-1 (`de`, `fr`, `ja`, …)
 * plus `zh-cn` / `zh-tw`. Other region tags (`en-US`, `pt-BR`) are mapped to the primary code.
 */
export const resolveTwitterLang = (explicit?: string): string => {
  const raw = (explicit || systemLocale()).trim().toLowerCase().replace(/_/g, '-');
  if (!raw) {
    return 'en';
  }
  const [primary, region] = raw.split('-');
  if (primary === 'zh') {
    return region === 'tw' || region === 'hk' || region === 'hant' ? 'zh-tw' : 'zh-cn';
  }
  return primary || 'en';
};
