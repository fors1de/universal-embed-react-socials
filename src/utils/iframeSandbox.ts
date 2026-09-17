/** Restrictive iframe sandbox without `allow-same-origin`. */
export const DEFAULT_IFRAME_SANDBOX =
  'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation';

export const resolveIframeSandbox = (value?: boolean | string): string | undefined => {
  if (value == null || value === false) {
    return undefined;
  }
  if (value === true) {
    return DEFAULT_IFRAME_SANDBOX;
  }
  return value;
};

export const sandboxAllowsSameOrigin = (sandbox?: string): boolean =>
  sandbox == null || /(^|\s)allow-same-origin(\s|$)/.test(sandbox);
