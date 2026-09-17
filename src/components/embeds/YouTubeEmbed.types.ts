import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedProps } from '../placeholder/PlaceholderEmbed.types';
import { playerIframeHtml } from './playerIframeHtml';
import { toQueryString } from '../../utils/query';

export interface YouTubePlayerVars {
  start?: number;
  autoplay?: number;
  controls?: number;
  loop?: number;
  mute?: number;
  rel?: number;
  [key: string]: string | number | undefined;
}

export interface YouTubeProps {
  videoId?: string;
  className?: string;
  opts?: {
    width?: string | number;
    height?: string | number;
    playerVars?: YouTubePlayerVars;
    [key: string]: unknown;
  };
  onReady?: (event: { target: unknown }) => void;
  [key: string]: unknown;
}

export interface YouTubeEmbedProps extends CommonEmbedProps {
  placeholderProps?: PlaceholderEmbedProps;
  youTubeProps?: YouTubeProps;
}

export const YOUTUBE_EMBED_HOST = 'https://www.youtube.com';
/** Third-party origin for native WebViews. Using youtube.com as the page origin triggers Error 152-4. */
export const YOUTUBE_NATIVE_ORIGIN = 'https://www.youtube-nocookie.com';

export const buildYouTubeSrc = (
  videoId: string,
  playerVars: YouTubePlayerVars = {},
  host: string = YOUTUBE_EMBED_HOST,
): string => {
  const query = toQueryString(playerVars);
  return `${host}/embed/${videoId}${query ? `?${query}` : ''}`;
};

/** WKWebView strips Referer on a bare embed URL, which YouTube rejects as Error 153. */
export const buildYouTubeEmbedHtml = (src: string): string =>
  playerIframeHtml({
    src,
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    extraHead: '<meta name="referrer" content="strict-origin-when-cross-origin" />',
    extraIframeAttrs: 'referrerpolicy="strict-origin-when-cross-origin"',
  });
