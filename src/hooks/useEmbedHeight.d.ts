import type { MutableRefObject } from 'react';

/** Parse a height out of a provider postMessage payload. Same on web and native. */
export declare const parseEmbedHeight: (data: unknown, depth?: number) => number | undefined;

export declare const useResponsiveEmbedScale: (
  designWidth: number,
  options?: { allowUpscale?: boolean; initialWidth?: number },
) => {
  boxRef: MutableRefObject<unknown>;
  boxWidth: number;
  scale: number;
};

export declare const useResponsiveEmbedBox: (
  designWidth: number,
  maxWidth?: string | number,
  options?: { allowUpscale?: boolean; fallbackMaxWidth?: number },
) => {
  boxRef: MutableRefObject<unknown>;
  boxWidth: number;
  scale: number;
  boxStyle: { width?: string | number; maxWidth?: string | number };
};

/**
 * Measure an embed iframe on web.
 * On React Native this is a no-op; native auto-height is handled inside the embed WebView.
 */
export declare const useAutoEmbedHeight: (options?: {
  enabled?: boolean;
  fallback?: number;
  measureSrcDoc?: boolean;
  measureSelector?: string;
  resetKey?: string | number;
}) => {
  height: number | undefined;
  measured: number | undefined;
  iframeRef: MutableRefObject<unknown>;
  containerRef: MutableRefObject<unknown>;
};
