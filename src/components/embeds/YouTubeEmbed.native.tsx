import { useEffect, useMemo } from 'react';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { getYouTubeStart, getYouTubeVideoId } from '../../utils/urls';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import {
  YOUTUBE_NATIVE_ORIGIN,
  buildYouTubeEmbedHtml,
  buildYouTubeSrc,
  type YouTubeEmbedProps,
  type YouTubePlayerVars,
} from './YouTubeEmbed.types';

export type { YouTubeEmbedProps, YouTubePlayerVars, YouTubeProps } from './YouTubeEmbed.types';

const defaultPlaceholderHeight = 360;
const youTubeHeaders = { Referer: `${YOUTUBE_NATIVE_ORIGIN}/` };

export const YouTubeEmbed = ({
  youTubeProps,
  placeholderText = 'Watch on YouTube',
  height,
  onError,
  embedDisabled,
  iframeTitle,
  ...props
}: YouTubeEmbedProps) => {
  const videoId = youTubeProps?.videoId || getYouTubeVideoId(props.url);
  const start = getYouTubeStart(props.url);
  const reportError = useEmbedOnError(onError, props.url);
  const resolvedTitle = embedIframeTitle('YouTube', { title: iframeTitle, id: videoId, url: props.url });
  useEffect(() => {
    if (!videoId && !embedDisabled) {
      reportError('invalid-url');
    }
  }, [embedDisabled, reportError, videoId]);
  const playerVars: YouTubePlayerVars = useMemo(
    () => ({
      playsinline: 1,
      rel: 0,
      origin: YOUTUBE_NATIVE_ORIGIN,
      ...(start ? { start } : {}),
      ...youTubeProps?.opts?.playerVars,
    }),
    [start, youTubeProps?.opts?.playerVars],
  );
  const html = useMemo(
    () =>
      videoId
        ? buildYouTubeEmbedHtml(buildYouTubeSrc(videoId, playerVars, YOUTUBE_NATIVE_ORIGIN), resolvedTitle)
        : undefined,
    [playerVars, resolvedTitle, videoId],
  );
  return (
    <NativeSocialEmbed
      {...props}
      embedDisabled={embedDisabled || !videoId}
      placeholderText={placeholderText}
      html={html}
      iframeTitle={resolvedTitle}
      baseUrl={YOUTUBE_NATIVE_ORIGIN}
      headers={youTubeHeaders}
      height={height ?? youTubeProps?.opts?.height}
      aspectRatio={16 / 9}
      fallbackHeight={defaultPlaceholderHeight}
      allowsInlineMediaPlayback
      onError={onError}
    />
  );
};
