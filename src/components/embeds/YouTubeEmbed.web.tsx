import { useEffect, useState } from 'react';
import { Box, IFrame } from '../../host';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { EMBED_GIVE_UP_MS } from '../../utils/embedLoad';
import { aspectRatioHeight, collapsedEmbedStyle, embedMaxWidthStyle, isPercentage, resolveEmbedMaxWidth } from '../../utils/style';
import { embedIframeTitle } from '../../utils/iframeTitle';
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
  onError,
  iframeTitle,
  className,
  style,
  id,
  testID,
}: YouTubeEmbedProps) => {
  const { ref: lazyRef, disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy);
  const reportError = useEmbedOnError(onError, url);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [url, embedDisabled]);

  const videoId = youTubeProps?.videoId || getYouTubeVideoId(url);
  const start = getYouTubeStart(url);

  useEffect(() => {
    if (embedDisabled || videoId) {
      return;
    }
    setFailed(true);
    reportError('invalid-url');
  }, [embedDisabled, reportError, videoId]);

  useEffect(() => {
    if (embedDisabled || ready || !videoId) {
      return;
    }
    const id = window.setTimeout(() => {
      setFailed(true);
      reportError('timeout');
    }, EMBED_GIVE_UP_MS);
    return () => window.clearTimeout(id);
  }, [url, embedDisabled, ready, videoId]);
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const percentageHeight = isPercentage(height);
  const autoHeight = height == null && youTubeProps?.opts?.height == null;
  const embedHeight = youTubeProps?.opts?.height ?? (percentageHeight ? '100%' : height);
  const aspectFallback = aspectRatioHeight(resolvedMaxWidth, 16 / 9, defaultPlaceholderHeight);

  const playerVars: YouTubePlayerVars = {
    ...(start ? { start } : {}),
    ...youTubeProps?.opts?.playerVars,
  };
  const src = videoId ? buildYouTubeSrc(videoId, playerVars) : '';

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
        id={id}
        testID={testID}
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
          {embedDisabled || !videoId ? null : (
          <Box style={{ width: '100%', height: '100%', visibility: ready ? 'visible' : 'hidden' }}>
            <IFrame
              key={videoId}
              className={youTubeProps?.className ?? 'youtube-iframe'}
              src={src}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={embedIframeTitle('YouTube', { title: iframeTitle, id: videoId, url })}
              onLoad={() => {
                setReady(true);
              }}
              onError={() => {
                setFailed(true);
                reportError('load-failed');
              }}
            />
          </Box>
          )}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};
