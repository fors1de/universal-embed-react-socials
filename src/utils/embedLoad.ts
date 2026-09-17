/** Time to wait for a provider widget/iframe before retrying or failing. */
export const EMBED_GIVE_UP_MS = 8000;

/** Extra widget remounts after the first attempt. Unresolvable posts must not loop. */
export const EMBED_MAX_RETRIES = 1;

/** Native WebView crash-reload attempts before giving up. */
export const EMBED_MAX_CRASH_RELOADS = 1;

export const EMBED_FAILED_STAGE = 'embed-failed';
