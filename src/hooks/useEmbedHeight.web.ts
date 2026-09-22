import { useEffect, useRef, useState } from 'react';
import { clampEmbedHeight, parseEmbedHeight, takeMeasuredHeight } from '../utils/embedHeight';
import { embedMaxWidthStyle, isPercentage } from '../utils/style';

export { parseEmbedHeight };

export const useResponsiveEmbedScale = (
  designWidth: number,
  {
    allowUpscale = false,
    initialWidth,
  }: { allowUpscale?: boolean; initialWidth?: number } = {},
) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxWidth, setBoxWidth] = useState(
    initialWidth && initialWidth > 0 ? initialWidth : designWidth,
  );
  const [widthMeasured, setWidthMeasured] = useState(false);

  useEffect(() => {
    const node = boxRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }
    const update = () => {
      const next = Math.round(node.getBoundingClientRect().width);
      if (next > 0) {
        setBoxWidth((prev) => (Math.abs(prev - next) < 2 ? prev : next));
        setWidthMeasured(true);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rawScale = designWidth > 0 ? boxWidth / designWidth : 1;
  return {
    boxRef,
    boxWidth,
    widthMeasured,
    scale: allowUpscale ? rawScale : Math.min(1, rawScale),
  };
};

export const useResponsiveEmbedBox = (
  designWidth: number,
  maxWidth?: string | number,
  options?: { allowUpscale?: boolean; fallbackMaxWidth?: number },
) => {
  const { boxRef, boxWidth, scale, widthMeasured } = useResponsiveEmbedScale(designWidth, {
    allowUpscale: options?.allowUpscale ?? true,
    initialWidth: typeof maxWidth === 'number' && maxWidth > 0 ? maxWidth : undefined,
  });
  return {
    boxRef,
    boxWidth,
    scale,
    widthMeasured,
    // Omit maxWidth → fill the parent at 100%.
    boxStyle: embedMaxWidthStyle(
      maxWidth,
      maxWidth == null || isPercentage(maxWidth)
        ? undefined
        : (options?.fallbackMaxWidth ?? designWidth),
    ),
  };
};

export const useAutoEmbedHeight = ({
  enabled = true,
  fallback,
  measureSrcDoc = false,
  measureSelector,
  resetKey,
}: {
  enabled?: boolean;
  fallback?: number;
  measureSrcDoc?: boolean;
  measureSelector?: string;
  resetKey?: string | number;
} = {}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stubSkipsRef = useRef(0);
  const [measured, setMeasured] = useState<number | undefined>();

  useEffect(() => {
    setMeasured(undefined);
    stubSkipsRef.current = 0;
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || !measureSrcDoc) {
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let srcWindow: Window | null = null;
    const defaultSelector = measureSelector ?? 'iframe';

    const handleFrameMessage = (event: MessageEvent) => {
      const next = takeMeasuredHeight(parseEmbedHeight(event.data), stubSkipsRef);
      if (next) {
        setMeasured((prev) => (prev === next ? prev : next));
      }
    };

    const readSize = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      const source = doc.querySelector<HTMLElement>(defaultSelector);
      if (!source) {
        return;
      }
      const rect = source.getBoundingClientRect();
      const next = takeMeasuredHeight(
        clampEmbedHeight(Math.ceil(Math.max(rect.height, source.scrollHeight))),
        stubSkipsRef,
      );
      if (next) {
        setMeasured((prev) => (prev === next ? prev : next));
      }
    };

    const isElement = (node: unknown): node is Element =>
      !!node && typeof node === 'object' && (node as Node).nodeType === 1;

    const attach = () => {
      const doc = iframe.contentDocument;
      const root = doc?.documentElement;
      if (!doc || !isElement(root)) {
        return;
      }
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(readSize);
        resizeObserver.observe(root);
        if (isElement(doc.body)) {
          resizeObserver.observe(doc.body);
        }
      }
      mutationObserver = new MutationObserver(() => {
        const inner = doc.querySelector(defaultSelector);
        if (isElement(inner) && resizeObserver) {
          resizeObserver.observe(inner);
        }
        readSize();
      });
      mutationObserver.observe(root, { childList: true, subtree: true, attributes: true });
      srcWindow?.removeEventListener('message', handleFrameMessage);
      srcWindow = doc.defaultView;
      srcWindow?.addEventListener('message', handleFrameMessage);
      readSize();
    };

    iframe.addEventListener('load', attach);
    attach();
    return () => {
      iframe.removeEventListener('load', attach);
      srcWindow?.removeEventListener('message', handleFrameMessage);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [enabled, measureSelector, measureSrcDoc, resetKey]);

  useEffect(() => {
    if (!enabled || measureSrcDoc) {
      return;
    }
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const readHeight = () => {
      const iframe = node.querySelector('iframe');
      const widget = iframe ?? node;
      const next = takeMeasuredHeight(
        clampEmbedHeight(Math.ceil(Math.max(widget.scrollHeight, widget.offsetHeight))),
        stubSkipsRef,
      );
      if (next) {
        setMeasured((prev) => (prev === next ? prev : next));
      }
    };

    readHeight();
    const resizeObserver = new ResizeObserver(readHeight);
    resizeObserver.observe(node);
    const mutationObserver = new MutationObserver(() => {
      const iframe = node.querySelector('iframe');
      if (iframe) {
        resizeObserver.observe(iframe);
      }
      readHeight();
    });
    mutationObserver.observe(node, { childList: true, subtree: true, attributes: true });
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [enabled, measureSrcDoc, resetKey]);

  return {
    height: enabled ? (measured ?? fallback) : fallback,
    measured,
    iframeRef,
    containerRef,
  };
};
