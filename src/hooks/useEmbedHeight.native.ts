export const parseEmbedHeight = (_data: unknown): number | undefined => undefined;

export const useResponsiveEmbedScale = (
  designWidth: number,
  _options?: { allowUpscale?: boolean },
) => ({
  boxRef: { current: null },
  boxWidth: designWidth,
  scale: 1,
});

export const useResponsiveEmbedBox = (
  designWidth: number,
  maxWidth?: string | number,
  _options?: { allowUpscale?: boolean; fallbackMaxWidth?: number },
) => ({
  boxRef: { current: null },
  boxWidth: designWidth,
  scale: 1,
  boxStyle: { width: maxWidth ?? designWidth, maxWidth: '100%' },
});

export const useAutoEmbedHeight = ({
  fallback,
}: {
  enabled?: boolean;
  fallback?: number;
  measureSrcDoc?: boolean;
  resetKey?: string | number;
} = {}) => ({
  height: fallback,
  measured: undefined as number | undefined,
  iframeRef: { current: null },
  containerRef: { current: null },
});
