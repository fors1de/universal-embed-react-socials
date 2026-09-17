import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';

export interface PinterestEmbedProps extends CommonEmbedProps {
  /** Canonical pin URL for the placeholder / link when it differs from the embed `url`. */
  postUrl?: string;
  placeholderProps?: PlaceholderEmbedOptions;
}
