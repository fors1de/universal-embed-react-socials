import type { CommonEmbedProps } from '../../types';
import type { PlaceholderEmbedOptions } from '../placeholder/PlaceholderEmbed.types';

export interface TwitterTweetEmbedProps {
  tweetId?: string;
  onLoad?: () => void;
}

export interface XEmbedProps extends CommonEmbedProps {
  placeholderProps?: PlaceholderEmbedOptions;
  twitterTweetEmbedProps?: TwitterTweetEmbedProps;
}
