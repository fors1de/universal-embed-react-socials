import type { EmbedWebViewMessageEvent, EmbedWebViewProps } from '../types';
import { parseUrl } from './parseUrl';

const messageType = 'rsme:tiktok-profile-link';

// Capture the original profile anchor before TikTok's mobile smart-link handler
// replaces it with an app-install or home-page redirect. Leave video controls alone.
export const tikTokProfileLinkScript = `
(function () {
  if (window.__rsmeTikTokProfileLinks) return;
  window.__rsmeTikTokProfileLinks = true;
  window.addEventListener('click', function (event) {
    var target = event.target;
    var element = target && (target.nodeType === 1 ? target : target.parentElement);
    var anchor = element && element.closest && element.closest('a[href]');
    if (!anchor || !window.ReactNativeWebView) return;
    try {
      var url = new URL(anchor.href, document.baseURI);
      if (!/^https?:$/.test(url.protocol) ||
          !(url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com')) ||
          !/^\\/@[a-zA-Z0-9._]+\\/?$/.test(url.pathname)) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: '${messageType}', url: url.href
      }));
      event.preventDefault();
      event.stopImmediatePropagation();
    } catch (_) {}
  }, true);
})();
true;
`;

const parseProfileLink = (data: string | undefined): string | undefined => {
  try {
    const message: unknown = JSON.parse(data ?? '');
    if (message == null || typeof message !== 'object' ||
        !('type' in message) || message.type !== messageType ||
        !('url' in message) || typeof message.url !== 'string') return undefined;
    const url = parseUrl(message.url);
    if (
      !url ||
      !/^https?:$/.test(url.protocol) ||
      !(url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com')) ||
      !/^\/@[a-zA-Z0-9._]+\/?$/.test(url.pathname)
    ) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
};

/** Preserve consumer scripts and callbacks while forwarding original profile clicks. */
export const withTikTokProfileLinks = (
  webViewProps: EmbedWebViewProps | undefined,
  openProfile: (url: string) => void,
): EmbedWebViewProps => ({
  // iOS player mode contains an iframe; it needs the same capture listener.
  injectedJavaScriptForMainFrameOnly: false,
  injectedJavaScriptBeforeContentLoadedForMainFrameOnly: false,
  ...webViewProps,
  injectedJavaScriptBeforeContentLoaded:
    `${tikTokProfileLinkScript}\n${webViewProps?.injectedJavaScriptBeforeContentLoaded ?? ''}\ntrue;`,
  injectedJavaScript:
    `${tikTokProfileLinkScript}\n${webViewProps?.injectedJavaScript ?? ''}\ntrue;`,
  onMessage: (event: EmbedWebViewMessageEvent) => {
    const profileUrl = parseProfileLink(event.nativeEvent.data);
    if (profileUrl) openProfile(profileUrl);
    webViewProps?.onMessage?.(event);
  },
});
