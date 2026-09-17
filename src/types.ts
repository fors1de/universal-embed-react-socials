import type { CSSProperties, ReactNode } from "react";
import type { EmbedWebViewProps } from "./webviewProps";

export type {
  EmbedWebViewMessageEvent,
  EmbedWebViewNavigationRequest,
  EmbedWebViewOpenWindowEvent,
  EmbedWebViewProps,
} from "./webviewProps";

/** Custom loading UI, or a render function. Return `null` to reserve no space. */
export type EmbedPlaceholder = ReactNode | (() => ReactNode);

/** Browser realm for provider scripts. Structural so RN typecheck can run without DOM libs. */
export interface FrameDocument {
  getElementById(id: string): { querySelector(selectors: string): unknown; remove(): void } | null;
  querySelector(selectors: string): unknown;
  head: { appendChild(node: unknown): unknown };
  createElement(tagName: string): {
    setAttribute(name: string, value: string): void;
    id: string;
    src: string;
    async: boolean;
    remove(): void;
  };
}

export interface Frame {
  window?: typeof globalThis & Record<string, unknown>;
  document?: FrameDocument;
}

export interface EmbedContainerProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  testID?: string;
}

export interface CommonEmbedProps extends EmbedContainerProps {
  url: string;
  /** Cap the embed width. On web the embed is `100%` of its container by default; pass a pixel or percent value to cap it. */
  maxWidth?: string | number;
  /** Omit to size the embed from the platform when possible. */
  height?: string | number;
  /** Text shown on the default placeholder. */
  placeholderText?: string;
  /** Custom loading placeholder. Wins over the default UI. Pass `null` or `() => null` to render nothing and reserve no height. */
  placeholder?: EmbedPlaceholder;
  placeholderImageUrl?: string;
  placeholderSpinner?: ReactNode;
  placeholderSpinnerDisabled?: boolean;
  /** Width of the placeholder box. Defaults to the embed width, then the provider default. */
  placeholderWidth?: string | number;
  /** Height of the placeholder box. Defaults to the embed height, then the provider default. */
  placeholderHeight?: string | number;
  placeholderStyle?: CSSProperties;
  placeholderDisabled?: boolean;
  /**
   * When true, keep the placeholder and do not load the live embed
   * (iframe, WebView, or provider scripts). Default `false`.
   */
  embedDisabled?: boolean;
  /** Extra `react-native-webview` props. Native only. */
  webViewProps?: EmbedWebViewProps;
  /**
   * Wait until the embed is near the viewport before loading provider scripts
   * or a WebView. Default `false`.
   */
  lazy?: boolean;
  /**
   * React Native only. Open tapped embed links in the system browser instead of the WebView.
   * Defaults to `true`. Ignored on web.
   */
  openLinksInBrowser?: boolean;
  /**
   * Web only. Facebook and Pinterest load provider HTML in a `blob:` iframe that
   * inherits this page's origin (cookies, `localStorage`, `parent.document`).
   * `true` applies a restrictive sandbox without `allow-same-origin`. Facebook
   * then uses the official plugin iframe; Pinterest keeps the blob iframe and
   * sizes via `postMessage`. Pass a string for custom sandbox tokens.
   */
  iframeSandbox?: boolean | string;
}
