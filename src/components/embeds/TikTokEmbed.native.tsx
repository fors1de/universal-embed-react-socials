import { useEffect, useMemo } from 'react';
import { Linking } from 'react-native';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { getTikTokVideoId } from '../../utils/urls';
import { resolveTikTokBrowserUrl } from '../../utils/tiktokUrls';
import { withTikTokProfileLinks } from '../../utils/tiktokProfileLinks';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import {
  TIKTOK_PLAYER_ASPECT_RATIO,
  TIKTOK_PLAYER_FALLBACK_HEIGHT,
  buildTikTokPlayerHtml,
  buildTikTokPlayerSrc,
  usesTikTokPlayer,
  type TikTokEmbedProps,
} from './TikTokEmbed.types';

export type {
  TikTokEmbedProps,
  TikTokPlayerFlag,
  TikTokPlayerVars,
} from './TikTokEmbed.types';

const defaultPlaceholderHeight = 739;

export const TikTokEmbed = ({
  url,
  placeholderText = 'View post on TikTok',
  webViewProps,
  openLinksInBrowser = true,
  allowsFullscreenVideo,
  tikTokProps,
  height,
  onError,
  embedDisabled,
  ...props
}: TikTokEmbedProps) => {
  const videoId = getTikTokVideoId(url);
  const reportError = useEmbedOnError(onError, url);
  useEffect(() => {
    if (!videoId && !embedDisabled) {
      reportError('invalid-url');
    }
  }, [embedDisabled, reportError, videoId]);
  const usePlayer = usesTikTokPlayer(allowsFullscreenVideo, tikTokProps);
  const html = useMemo(
    () =>
      usePlayer && videoId ? buildTikTokPlayerHtml(buildTikTokPlayerSrc(videoId, tikTokProps)) : undefined,
    [tikTokProps, usePlayer, videoId],
  );
  return (
    <NativeSocialEmbed
      {...props}
      url={url}
      height={height}
      embedDisabled={embedDisabled || !videoId}
      placeholderText={placeholderText}
      onError={onError}
      {...(usePlayer
        ? {
            html,
            baseUrl: 'https://www.tiktok.com',
            aspectRatio: height == null ? TIKTOK_PLAYER_ASPECT_RATIO : undefined,
            allowsFullscreenVideo: allowsFullscreenVideo !== false,
          }
        : { uri: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : undefined })}
      fallbackHeight={usePlayer ? TIKTOK_PLAYER_FALLBACK_HEIGHT : defaultPlaceholderHeight}
      allowsInlineMediaPlayback
      openLinksInBrowser={openLinksInBrowser}
      resolveExternalUrl={(targetUrl: string) => resolveTikTokBrowserUrl(targetUrl, url)}
      webViewProps={
        openLinksInBrowser
          ? withTikTokProfileLinks(webViewProps, (profileUrl) => {
              Linking.openURL(profileUrl).catch(() => undefined);
            })
          : webViewProps
      }
    />
  );
};
