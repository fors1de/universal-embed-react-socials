import { useEffect, useId, useMemo, useState } from 'react';
import { IFrame } from '../../host';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { EMBED_GIVE_UP_MS } from '../../utils/embedLoad';
import { resolveIframeSandbox } from '../../utils/iframeSandbox';
import { embedMaxWidthStyle, isPercentage, resolveEmbedMaxWidth } from '../../utils/style';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { pinterestEmbedHtml } from './embedHtml';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import type { PinterestEmbedProps } from './PinterestEmbed.types';

export type { PinterestEmbedProps } from './PinterestEmbed.types';

const officialEmbedHeight = 900;
const borderRadius = 16;

export const PinterestEmbed = ({
  url,
  postUrl,
  maxWidth,
  height,
  placeholderText = 'View post on Pinterest',
  placeholderImageUrl,
  placeholderSpinner,
  placeholderSpinnerDisabled = false,
  placeholderProps,
  placeholder,
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderDisabled = false,
  embedDisabled: embedDisabledProp = false,
  lazy = false,
  iframeSandbox,
  onError,
  className,
  style,
}: PinterestEmbedProps) => {
  const { ref: lazyRef, disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy);
  const reportError = useEmbedOnError(onError, url);
  const sandbox = resolveIframeSandbox(iframeSandbox);
  const embedId = useId();
  const postHref = postUrl ?? url;
  const embedHtml = useMemo(
    () => pinterestEmbedHtml({ url: postHref, fillWidth: true, embedId }),
    [embedId, postHref],
  );
  const [frameSrc, setFrameSrc] = useState<string | undefined>();
  const [pinHeight, setPinHeight] = useState(0);
  const [failed, setFailed] = useState(false);
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const percentageHeight = isPercentage(height);

  useEffect(() => {
    if (embedDisabled) {
      setFrameSrc(undefined);
      setPinHeight(0);
      setFailed(false);
      return;
    }
    const blob = new Blob([embedHtml], { type: 'text/html' });
    const next = URL.createObjectURL(blob);
    setFrameSrc(next);
    setPinHeight(0);
    setFailed(false);
    return () => URL.revokeObjectURL(next);
  }, [embedHtml, embedDisabled]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== 'null') {
        return;
      }
      const data = event.data as { source?: string; id?: string; height?: number } | null;
      if (!data || data.source !== 'rsme-pinterest' || data.id !== embedId) {
        return;
      }
      const nextHeight = data.height;
      if (typeof nextHeight === 'number' && nextHeight > 50) {
        setPinHeight((prev) => (Math.abs(prev - nextHeight) < 2 ? prev : Math.round(nextHeight)));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [embedId]);

  useEffect(() => {
    if (embedDisabled || pinHeight > 0) {
      return;
    }
    const id = window.setTimeout(() => {
      setFailed(true);
      reportError('timeout');
    }, EMBED_GIVE_UP_MS);
    return () => window.clearTimeout(id);
  }, [embedDisabled, embedHtml, pinHeight]);

  const frameHeight = typeof height === 'number' ? height : pinHeight;
  const ready = !embedDisabled && frameHeight > 0;
  const shellHeight = percentageHeight
    ? '100%'
    : frameHeight || (embedDisabled ? officialEmbedHeight : undefined);

  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url: postHref,
    placeholderText,
    placeholder,
    placeholderDisabled,
    placeholderImageUrl,
    placeholderSpinner,
    placeholderSpinnerDisabled: placeholderSpinnerDisabled || failed,
    placeholderProps,
    placeholderWidth,
    placeholderHeight,
    placeholderStyle,
    extraStyle: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: resolvedMaxWidth,
    providerHeight: officialEmbedHeight,
  });

  return (
    <div ref={lazyRef} style={{ ...embedMaxWidthStyle(resolvedMaxWidth), minWidth: 0 }}>
      <EmbedShell
        className={className}
        extraClassName="rsme-pinterest-embed"
        width="100%"
        height={shellHeight}
        borderRadius={borderRadius}
        style={style}
      >
        <MediaFrame showPlaceholder={!ready && !placeholderDisabled} placeholder={resolvedPlaceholder}>
          {embedDisabled || !frameSrc ? null : (
            <IFrame
              key={postHref}
              src={frameSrc}
              width="100%"
              height={frameHeight || officialEmbedHeight}
              title="Pinterest embed"
              sandbox={sandbox}
              style={{
                width: '100%',
                height: frameHeight || officialEmbedHeight,
                overflow: 'hidden',
              }}
            />
          )}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};
