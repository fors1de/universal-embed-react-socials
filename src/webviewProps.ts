/** Message from `window.ReactNativeWebView.postMessage`. */
export interface EmbedWebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

/** Navigation request passed to `onShouldStartLoadWithRequest`. */
export interface EmbedWebViewNavigationRequest {
  url: string;
  navigationType?: string;
  isTopFrame?: boolean;
}

/** iOS / Android `onOpenWindow` payload. */
export interface EmbedWebViewOpenWindowEvent {
  nativeEvent: {
    targetUrl: string;
  };
}

/**
 * Extra `react-native-webview` props forwarded on React Native. Ignored on web.
 *
 * `source` is owned by the embed. Listed callbacks are composed: the library
 * handler runs and the consumer handler still runs. `setSupportMultipleWindows`
 * defaults from `openLinksInBrowser` when omitted. Crash recovery owns
 * `onContentProcessDidTerminate` (one reload, then `onError`) and then calls
 * the consumer.
 */
export interface EmbedWebViewProps {
  source?: never;
  userAgent?: string;
  applicationNameForUserAgent?: string;
  originWhitelist?: string[];
  javaScriptEnabled?: boolean;
  javaScriptCanOpenWindowsAutomatically?: boolean;
  domStorageEnabled?: boolean;
  allowsInlineMediaPlayback?: boolean;
  mediaPlaybackRequiresUserAction?: boolean;
  allowsFullscreenVideo?: boolean;
  sharedCookiesEnabled?: boolean;
  thirdPartyCookiesEnabled?: boolean;
  cacheEnabled?: boolean;
  incognito?: boolean;
  mixedContentMode?: 'never' | 'always' | 'compatibility';
  nestedScrollEnabled?: boolean;
  scrollEnabled?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  injectedJavaScript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  injectedJavaScriptForMainFrameOnly?: boolean;
  injectedJavaScriptBeforeContentLoadedForMainFrameOnly?: boolean;
  onMessage?: (event: EmbedWebViewMessageEvent) => void;
  onLoad?: (event: unknown) => void;
  onLoadEnd?: (event: unknown) => void;
  onLoadStart?: (event: unknown) => void;
  onError?: (event: unknown) => void;
  onHttpError?: (event: unknown) => void;
  onShouldStartLoadWithRequest?: (request: EmbedWebViewNavigationRequest) => boolean;
  onOpenWindow?: (event: EmbedWebViewOpenWindowEvent) => void;
  onNavigationStateChange?: (request: EmbedWebViewNavigationRequest) => void;
  onContentProcessDidTerminate?: (event?: unknown) => void;
  setSupportMultipleWindows?: boolean;
  style?: object;
  [key: string]: unknown;
}
