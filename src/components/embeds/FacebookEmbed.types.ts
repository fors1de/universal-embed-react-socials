import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';

export interface FacebookEmbedProps extends CommonEmbedProps {
  placeholderProps?: PlaceholderEmbedOptions;
  /** Facebook Graph API / JS SDK version, e.g. `"v26.0"`, `"26.0"`, or `"26"`. */
  apiVersion?: string;
  /** Facebook SDK locale, e.g. `"en_US"`. */
  locale?: string;
}
