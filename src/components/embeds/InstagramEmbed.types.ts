import type { CommonEmbedProps, Frame } from '../../types';
import type { PlaceholderEmbedProps } from '../placeholder/PlaceholderEmbed.types';

export const INSTAGRAM_PLACEHOLDER_HEIGHT = 740;
export const INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT = 820;

export interface InstagramEmbedProps extends CommonEmbedProps {
  captioned?: boolean;
  placeholderProps?: PlaceholderEmbedProps;
  scriptLoadDisabled?: boolean;
  retryDelay?: number;
  retryDisabled?: boolean;
  /** Instagram embed.js `data-instgrm-version`. Current official embed markup uses `"14"`. */
  apiVersion?: string;
  frame?: Frame;
  debug?: boolean;
}
