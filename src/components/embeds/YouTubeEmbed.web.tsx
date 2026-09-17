import { useEffect, useState } from 'react';
import { Box, IFrame } from '../../host';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { EMBED_GIVE_UP_MS } from '../../utils/embedLoad';
import { aspectRatioHeight, collapsedEmbedStyle, embedMaxWidthStyle, isPercentage, resolveEmbedMaxWidth } from '../../utils/style';
import { getYouTubeStart, getYouTubeVideoId } from '../../utils/urls';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import { buildYouTubeSrc, type YouTubeEmbedProps, type YouTubePlayerVars } from './YouTubeEmbed.types';

export type { YouTubeEmbedProps, YouTubePlayerVars, YouTubeProps } from './YouTubeEmbed.types';

const defaultPlaceholderHeight = 360;
const borderRadius = 0;

export const YouTubeEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'Watch on YouTube',
  placeholderImageUrl,
  placeholderSpinner,
  placeholderSpinnerDisabled = false,
  placeholderProps,
  placeholder,
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderDisabled,
  embedDisabled: embedDisabledProp = false,
  lazy = false,
  youTubeProps,
  className,
  style,
}: YouTubeEmbedProps) => {
  const { ref: lazyRef, disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [url, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || ready) {
      return;
    }
    const id = window.setTimeout(() => setFailed(true), EMBED_GIVE_UP_MS);
    return () => window.clearTimeout(id);
  }, [url, embedDisabled, ready]);
  const videoId = youTubeProps?.videoId ?? getYouTubeVideoId(url);
  const start = getYouTubeStart(url);
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const percentageHeight = isPercentage(height);
  const autoHeight = height == null && youTubeProps?.opts?.height == null;
  const embedHeight = youTubeProps?.opts?.height ?? (percentageHeight ? '100%' : height);
  const aspectFallback = aspectRatioHeight(resolvedMaxWidth, 16 / 9, defaultPlaceholderHeight);

  const playerVars: YouTubePlayerVars = {
    ...(start ? { start } : {}),
    ...youTubeProps?.opts?.playerVars,
  };
  const src = buildYouTubeSrc(videoId, playerVars);

  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url,
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
    extraStyle: { borderRadius },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: resolvedMaxWidth,
    providerHeight: typeof embedHeight === 'number' ? embedHeight : aspectFallback,
  });
  const hasPlaceholder = resolvedPlaceholder != null;
  const reserveFrame = ready || hasPlaceholder || embedDisabled;

  return (
    <div ref={lazyRef} style={{ ...embedMaxWidthStyle(resolvedMaxWidth), ...collapsedEmbedStyle(!reserveFrame) }}>
      <EmbedShell
        className={className}
        extraClassName="rsme-youtube-embed"
        width="100%"
        height={!reserveFrame ? 0 : autoHeight ? undefined : embedHeight}
        borderRadius={borderRadius}
        style={{
          ...(autoHeight && reserveFrame ? { aspectRatio: '16 / 9' } : {}),
          ...collapsedEmbedStyle(!reserveFrame),
          ...style,
        }}
      >
        <MediaFrame showPlaceholder={(!ready || embedDisabled) && hasPlaceholder} placeholder={resolvedPlaceholder}>
          {embedDisabled ? null : (
          <Box style={{ width: '100%', height: '100%', visibility: ready ? 'visible' : 'hidden' }}>
            <IFrame
              key={videoId}
              className={youTubeProps?.className ?? 'youtube-iframe'}
              src={src}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="YouTube embed"
              onLoad={() => {
                setReady(true);
                youTubeProps?.onReady?.({ target: undefined });
              }}
            />
          </Box>
          )}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};
