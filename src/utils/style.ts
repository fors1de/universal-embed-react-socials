import type { CSSProperties } from 'react';

export const aspectRatioHeight = (
  width: string | number | undefined,
  ratio = 16 / 9,
  fallback = 360,
): number => {
  if (typeof width === 'number' && width > 0) {
    return Math.round(width / ratio);
  }
  return fallback;
};

export const isPercentage = (value?: string | number): boolean => !!value?.toString().includes('%');

export const resolveEmbedFrame = ({
  ready,
  measuredHeight,
  fallbackHeight,
  scale = 1,
  height,
  waitForMeasure = true,
}: {
  ready: boolean;
  measuredHeight?: number;
  fallbackHeight: number;
  scale?: number;
  height?: string | number;
  waitForMeasure?: boolean;
}): { frameHeight: string | number; showPlaceholder: boolean } => {
  if (height != null) {
    return { frameHeight: height, showPlaceholder: !ready };
  }
  const scaledFallback = Math.round(fallbackHeight * scale);
  const scaledMeasured =
    typeof measuredHeight === 'number' ? Math.round(measuredHeight * scale) : undefined;
  const reveal = ready && (!waitForMeasure || scaledMeasured != null);
  return {
    frameHeight: reveal && scaledMeasured != null ? scaledMeasured : scaledFallback,
    showPlaceholder: !reveal,
  };
};

export const placeholderOverlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  overflow: 'hidden',
};

/** Web embeds fill the parent unless `maxWidth` is set. */
export const DEFAULT_WEB_EMBED_WIDTH = '100%';

export const resolveEmbedMaxWidth = (maxWidth?: string | number): string | number =>
  maxWidth ?? DEFAULT_WEB_EMBED_WIDTH;

export const embedMaxWidthStyle = (
  maxWidth?: string | number,
  fallbackMax?: number,
): CSSProperties => {
  if (maxWidth == null) {
    return { width: DEFAULT_WEB_EMBED_WIDTH, maxWidth: '100%' };
  }
  if (typeof maxWidth === 'number') {
    return { width: maxWidth, maxWidth: '100%' };
  }
  if (isPercentage(maxWidth) || maxWidth.trim() !== '') {
    return { width: maxWidth, maxWidth: '100%' };
  }
  return {
    width: fallbackMax ?? DEFAULT_WEB_EMBED_WIDTH,
    maxWidth: '100%',
  };
};

export const embedScaleStyle = (scale: number, designWidth: number): CSSProperties => ({
  width: designWidth,
  transform: `scale(${scale})`,
  transformOrigin: 'top left',
});

/** Pixel number, unitless numeric string, or `Npx`. Other CSS units are not converted. */
export const parseCssPx = (value: string | number | undefined): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(px)?$/i);
  if (!match) {
    return undefined;
  }
  return Number(match[1]);
};

export const toNativeSize = (value: string | number | undefined, fallback: number): number =>
  parseCssPx(value) ?? fallback;

export const collapsedEmbedStyle = (collapsed: boolean): CSSProperties =>
  collapsed ? { height: 0, minHeight: 0, overflow: 'hidden' } : {};

export const boxSizeStyle = (
  width?: string | number,
  height?: string | number,
  extra?: CSSProperties,
): CSSProperties => ({
  ...extra,
  overflow: 'hidden',
  ...(width != null ? { width } : {}),
  ...(height != null ? { height } : {}),
});
