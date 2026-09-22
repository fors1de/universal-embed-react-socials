import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';

export interface TwitterTweetEmbedProps {
  tweetId?: string;
  onLoad?: () => void;
  /** Widget chrome locale (`en`, `de`, `ja`, `zh-cn`, or Facebook-style `en_US`). Defaults to the system locale. */
  locale?: string;
}

export interface XEmbedProps extends CommonEmbedProps {
  placeholderProps?: PlaceholderEmbedOptions;
  twitterTweetEmbedProps?: TwitterTweetEmbedProps;
  /** Widget chrome locale. Defaults to the browser / system locale. */
  locale?: string;
}
