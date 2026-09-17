import type { CommonEmbedProps, Frame } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';
import { playerIframeHtml } from './playerIframeHtml';
import { toQueryString } from '../../utils/query';

/** Official Embed Player query flags. https://developers.tiktok.com/doc/embed-player */
export type TikTokPlayerFlag = 0 | 1;

export interface TikTokPlayerVars {
  controls?: TikTokPlayerFlag;
  progress_bar?: TikTokPlayerFlag;
  play_button?: TikTokPlayerFlag;
  volume_control?: TikTokPlayerFlag;
  fullscreen_button?: TikTokPlayerFlag;
  timestamp?: TikTokPlayerFlag;
  loop?: TikTokPlayerFlag;
  autoplay?: TikTokPlayerFlag;
  music_info?: TikTokPlayerFlag;
  description?: TikTokPlayerFlag;
  rel?: TikTokPlayerFlag;
  native_context_menu?: TikTokPlayerFlag;
  closed_caption?: TikTokPlayerFlag;
  muted?: TikTokPlayerFlag;
}

export interface TikTokEmbedProps extends CommonEmbedProps {
  placeholderProps?: PlaceholderEmbedOptions;
  /**
   * Use TikTok's Embed Player (`/player/v1`) so fullscreen stays in-app
   * instead of opening TikTok. Defaults to `false` (oEmbed card).
   */
  allowsFullscreenVideo?: boolean;
  /** Official Embed Player query parameters. Implies the Embed Player. */
  tikTokProps?: TikTokPlayerVars;
}

/** Web only. Ignored on React Native. */
export interface TikTokEmbedWebProps {
  scriptLoadDisabled?: boolean;
  retryDelay?: number;
  retryDisabled?: boolean;
  frame?: Frame;
  debug?: boolean;
}

export const TIKTOK_PLAYER_HOST = 'https://www.tiktok.com';
export const TIKTOK_PLAYER_ASPECT_RATIO = 9 / 16;
export const TIKTOK_PLAYER_FALLBACK_HEIGHT = 580;

export const usesTikTokPlayer = (
  allowsFullscreenVideo?: boolean,
  tikTokProps?: TikTokPlayerVars,
): boolean => allowsFullscreenVideo === true || tikTokProps != null;

export const buildTikTokPlayerSrc = (
  videoId: string,
  playerVars: TikTokPlayerVars = {},
): string => {
  const query = toQueryString(playerVars);
  return `${TIKTOK_PLAYER_HOST}/player/v1/${videoId}${query ? `?${query}` : ''}`;
};

export const buildTikTokPlayerHtml = (src: string): string =>
  playerIframeHtml({
    src,
    allow: 'fullscreen; autoplay; encrypted-media',
    extraIframeAttrs: 'title="TikTok embed"',
  });
