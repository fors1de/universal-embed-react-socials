import type { ReactNode } from 'react';
import type { EmbedError, EmbedWebViewProps } from '../../types';

export interface NativeEmbedViewProps {
  html?: string;
  uri?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  width?: string | number;
  height?: string | number;
  aspectRatio?: number;
  /** Grow the WebView to the widget height. Defaults off when `height` or `aspectRatio` is set. */
  autoHeight?: boolean;
  /** Official embed width. The native box scales this design size to the layout width. */
  fitDesignWidth?: number;
  style?: unknown;
  fallbackHeight: number;
  placeholder?: ReactNode;
  placeholderDisabled?: boolean;
  embedDisabled?: boolean;
  lazy?: boolean;
  allowsInlineMediaPlayback?: boolean;
  mediaPlaybackRequiresUserAction?: boolean;
  allowsFullscreenVideo?: boolean;
  openLinksInBrowser?: boolean;
  /** Provider-specific normalization before opening an external browser. */
  resolveExternalUrl?: (url: string) => string;
  webViewProps?: EmbedWebViewProps;
  url?: string;
  onError?: (error: EmbedError) => void;
}
