import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Linking, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  EmbedWebViewMessageEvent,
  EmbedWebViewNavigationRequest,
  EmbedWebViewOpenWindowEvent,
} from '../../types';
import { EMBED_MAX_CRASH_RELOADS } from '../../utils/embedLoad';
import { takeMeasuredHeight } from '../../utils/embedHeight';
import { toNativeSize } from '../../utils/style';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import {
  AUTO_HEIGHT_TOPIC,
  injectAutoHeightScript,
  nativeAutoHeightScript,
  parseAutoHeightMessage,
} from './nativeEmbedHeight';
import type { NativeEmbedViewProps } from './NativeEmbedView.types';

export type { NativeEmbedViewProps } from './NativeEmbedView.types';

const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url);

const normalizeUrl = (url: string): string => url.replace(/\/$/, '').split('#')[0];

const isEmbedHostPath = (url: string, host: string, path: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(host) && parsed.pathname.includes(path);
  } catch {
    return false;
  }
};

const isProviderEmbedUrl = (url: string): boolean =>
  isEmbedHostPath(url, 'tiktok.com', '/embed') ||
  isEmbedHostPath(url, 'tiktok.com', '/player') ||
  isEmbedHostPath(url, 'facebook.com', '/plugins') ||
  isEmbedHostPath(url, 'linkedin.com', '/embed') ||
  isEmbedHostPath(url, 'instagram.com', '/embed') ||
  isEmbedHostPath(url, 'pinterest.com', '/embed') ||
  isEmbedHostPath(url, 'youtube.com', '/embed') ||
  isEmbedHostPath(url, 'youtube-nocookie.com', '/embed');

const isEmbedDocumentUrl = (url: string, uri?: string, baseUrl?: string): boolean => {
  if (!url || url === 'about:blank' || url.startsWith('data:') || url.startsWith('blob:')) {
    return true;
  }
  const normalized = normalizeUrl(url);
  if (uri != null && (normalized === normalizeUrl(uri) || url.startsWith(uri))) {
    return true;
  }
  if (isProviderEmbedUrl(url)) {
    return true;
  }
  return baseUrl != null && normalized === normalizeUrl(baseUrl);
};

const shouldOpenInBrowser = (
  request: EmbedWebViewNavigationRequest,
  uri: string | undefined,
  baseUrl: string | undefined,
  enabled: boolean,
): boolean => {
  if (!enabled) {
    return false;
  }
  const url = request.url ?? '';
  if (!isHttpUrl(url) || isEmbedDocumentUrl(url, uri, baseUrl)) {
    return false;
  }
  if (request.navigationType === 'click') {
    return true;
  }
  return request.isTopFrame === true;
};

const openExternalUrl = (url: string) => {
  Linking.openURL(url).catch(() => undefined);
};

export const NativeEmbedView = ({
  html,
  uri,
  baseUrl,
  headers,
  width,
  height,
  aspectRatio,
  autoHeight,
  fitDesignWidth,
  style,
  fallbackHeight,
  placeholder,
  placeholderDisabled,
  embedDisabled = false,
  lazy = false,
  allowsInlineMediaPlayback = false,
  mediaPlaybackRequiresUserAction = true,
  allowsFullscreenVideo = false,
  openLinksInBrowser = true,
  resolveExternalUrl,
  webViewProps,
  url = '',
  onError,
  id,
  testID,
}: NativeEmbedViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const wrapRef = useRef<View>(null);
  const [ready, setReady] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [lazyVisible, setLazyVisible] = useState(!lazy);
  const [sizeTimedOut, setSizeTimedOut] = useState(false);
  const hasPlaceholder = placeholder != null && !placeholderDisabled;
  const blocked = embedDisabled || (lazy && !lazyVisible);
  const lazyCheckRef = useRef(() => {});
  const crashReloadsRef = useRef(0);
  const stubSkipsRef = useRef(0);
  const reportError = useEmbedOnError(onError, url);

  useEffect(() => {
    setReady(false);
    setMeasuredHeight(0);
    setSizeTimedOut(false);
    crashReloadsRef.current = 0;
    stubSkipsRef.current = 0;
  }, [html, uri]);

  useEffect(() => {
    if (embedDisabled) {
      setReady(false);
      setMeasuredHeight(0);
    }
  }, [embedDisabled]);

  useEffect(() => {
    if (!lazy || embedDisabled || lazyVisible) {
      lazyCheckRef.current = () => {};
      return;
    }
    let cancelled = false;
    let windowSize = Dimensions.get('window');
    const check = () => {
      wrapRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
        if (cancelled) {
          return;
        }
        const intersects =
          width > 0 &&
          height > 0 &&
          y < windowSize.height + 200 &&
          y + height > -200 &&
          x < windowSize.width &&
          x + width > 0;
        if (intersects) {
          setLazyVisible(true);
        }
      });
    };
    lazyCheckRef.current = check;
    check();
    const onChange = ({ window }: { window: { width: number; height: number } }) => {
      windowSize = window;
      check();
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    const id = setInterval(check, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
      subscription?.remove?.();
      lazyCheckRef.current = () => {};
    };
  }, [embedDisabled, lazy, lazyVisible]);
  const fitEnabled = fitDesignWidth != null && fitDesignWidth > 0 && height == null;
  const autoHeightEnabled = autoHeight ?? (height == null && aspectRatio == null);
  const waitingForSize = autoHeightEnabled && measuredHeight <= 0 && !sizeTimedOut;
  const showPlaceholder = hasPlaceholder && (blocked || !ready || waitingForSize);

  useEffect(() => {
    if (autoHeightEnabled) {
      return;
    }
    setMeasuredHeight(0);
    setSizeTimedOut(false);
    stubSkipsRef.current = 0;
  }, [autoHeightEnabled, height]);

  useEffect(() => {
    if (!waitingForSize || !ready) {
      return;
    }
    const id = setTimeout(() => setSizeTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, [ready, waitingForSize]);
  const useAspectRatio = aspectRatio != null && height == null && !autoHeightEnabled;
  const designHeight = autoHeightEnabled && measuredHeight > 0
    ? measuredHeight
    : toNativeSize(height, fallbackHeight);
  const fitScale = fitEnabled && boxWidth > 0 ? boxWidth / fitDesignWidth : 1;
  const fittedHeight = fitEnabled ? Math.max(1, Math.round(designHeight * fitScale)) : undefined;
  const resolvedHeight = useAspectRatio
    ? undefined
    : fittedHeight != null
      ? fittedHeight
      : autoHeightEnabled && measuredHeight > 0
        ? measuredHeight
        : toNativeSize(height, ready || hasPlaceholder || blocked ? fallbackHeight : 0);
  const {
    style: webViewStyle,
    onLoad,
    onMessage,
    onError: onWebViewError,
    onHttpError: onWebViewHttpError,
    injectedJavaScript,
    source: _source,
    onShouldStartLoadWithRequest,
    onOpenWindow,
    setSupportMultipleWindows: supportMultipleWindows,
    onContentProcessDidTerminate,
    injectedJavaScriptBeforeContentLoaded,
    ...restWebViewProps
  } = webViewProps ?? {};
  const sizingScript =
    autoHeightEnabled && !(html && html.includes(AUTO_HEIGHT_TOPIC))
      ? nativeAutoHeightScript
      : '';
  const uriBootScript = html ? '' : sizingScript;
  // Memoized so a re-rendering parent that rebuilds an identical HTML string
  // does not hand the WebView a new `source` and force a reload.
  const source = useMemo(
    () =>
      html
        ? {
            html: sizingScript ? injectAutoHeightScript(html, sizingScript) : html,
            baseUrl,
            headers,
          }
        : { uri: uri ?? '', headers },
    [baseUrl, headers, html, sizingScript, uri],
  );

  return (
    <View
      ref={wrapRef}
      nativeID={id}
      testID={testID}
      onLayout={(event: { nativeEvent: { layout: { width: number } } }) => {
        const next = Math.round(event.nativeEvent.layout.width);
        setBoxWidth((prev) => (Math.abs(prev - next) < 2 ? prev : next));
        lazyCheckRef.current();
      }}
      style={[
        {
          overflow: 'hidden',
          width: width ?? '100%',
          ...(useAspectRatio ? { aspectRatio } : { height: resolvedHeight }),
        },
        style as StyleProp<ViewStyle>,
      ]}
    >
      <View
        style={
          fitEnabled
            ? {
                width: fitDesignWidth,
                height: designHeight,
                transform: [{ scale: fitScale }],
                transformOrigin: 'top left',
              }
            : { width: '100%', height: '100%' }
        }
      >
        {!blocked ? (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mixedContentMode="always"
            automaticallyAdjustContentInsets={false}
            allowsInlineMediaPlayback={allowsInlineMediaPlayback}
            mediaPlaybackRequiresUserAction={mediaPlaybackRequiresUserAction}
            allowsFullscreenVideo={allowsFullscreenVideo}
            setSupportMultipleWindows={
              supportMultipleWindows !== undefined ? supportMultipleWindows : openLinksInBrowser
            }
            scrollEnabled={!autoHeightEnabled && !fitEnabled && !useAspectRatio}
            bounces={false}
            overScrollMode="never"
            {...restWebViewProps}
            source={source}
            injectedJavaScriptBeforeContentLoaded={
              uriBootScript
                ? `${uriBootScript}\n${injectedJavaScriptBeforeContentLoaded ?? ''}`
                : injectedJavaScriptBeforeContentLoaded
            }
            injectedJavaScript={
              uriBootScript ? `${uriBootScript}\n${injectedJavaScript ?? ''}` : injectedJavaScript
            }
            onMessage={(event: EmbedWebViewMessageEvent) => {
              onMessage?.(event);
              if (!autoHeightEnabled) {
                return;
              }
              const next = takeMeasuredHeight(
                parseAutoHeightMessage(event?.nativeEvent?.data),
                stubSkipsRef,
              );
              if (next) {
                setMeasuredHeight((prev) => (prev === next ? prev : next));
              }
            }}
            onShouldStartLoadWithRequest={(request: EmbedWebViewNavigationRequest) => {
              const targetUrl = openLinksInBrowser
                ? (resolveExternalUrl?.(request.url) ?? request.url)
                : request.url;
              const nextRequest = { ...request, url: targetUrl };
              const consumer = onShouldStartLoadWithRequest?.(nextRequest);
              if (consumer === false) {
                return false;
              }
              if (shouldOpenInBrowser(nextRequest, uri, baseUrl, openLinksInBrowser)) {
                openExternalUrl(targetUrl);
                return false;
              }
              return consumer ?? true;
            }}
            onOpenWindow={(event: EmbedWebViewOpenWindowEvent) => {
              onOpenWindow?.(event);
              const requestedUrl = event.nativeEvent.targetUrl;
              const targetUrl = openLinksInBrowser
                ? (resolveExternalUrl?.(requestedUrl) ?? requestedUrl)
                : requestedUrl;
              if (openLinksInBrowser && targetUrl && isHttpUrl(targetUrl)) {
                openExternalUrl(targetUrl);
              }
            }}
            onLoad={(event: unknown) => {
              setReady(true);
              onLoad?.(event);
            }}
            onError={(event: unknown) => {
              reportError('load-failed');
              onWebViewError?.(event);
            }}
            onHttpError={(event: unknown) => {
              reportError('load-failed');
              onWebViewHttpError?.(event);
            }}
            onContentProcessDidTerminate={(event?: unknown) => {
              if (crashReloadsRef.current >= EMBED_MAX_CRASH_RELOADS) {
                reportError('load-failed');
                onContentProcessDidTerminate?.(event);
                return;
              }
              crashReloadsRef.current += 1;
              webViewRef.current?.reload();
              onContentProcessDidTerminate?.(event);
            }}
            style={[
              {
                width: fitEnabled ? fitDesignWidth : '100%',
                height: fitEnabled ? designHeight : '100%',
                backgroundColor: 'transparent',
              },
              webViewStyle,
            ]}
          />
        ) : null}
      </View>
      {showPlaceholder ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{placeholder}</View>
      ) : null}
    </View>
  );
};
