import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';

export interface LinkedInEmbedProps extends CommonEmbedProps {
  /** Canonical post URL for the placeholder / link when it differs from the embed `url`. */
  postUrl?: string;
  placeholderProps?: PlaceholderEmbedOptions;
}
