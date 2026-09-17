import { useMemo } from 'react';
import { getXPostId } from '../../utils/urls';
import { xEmbedHtml } from './embedHtml';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import type { XEmbedProps } from './XEmbed.types';

export type { TwitterTweetEmbedProps, XEmbedProps } from './XEmbed.types';

const defaultPlaceholderHeight = 560;

export const XEmbed = ({
  twitterTweetEmbedProps,
  placeholderText = 'View post on X',
  webViewProps,
  ...props
}: XEmbedProps) => {
  const postId = twitterTweetEmbedProps?.tweetId ?? getXPostId(props.url);
  const html = useMemo(() => xEmbedHtml({ postId }), [postId]);
  return (
    <NativeSocialEmbed
      {...props}
      placeholderText={placeholderText}
      html={html}
      baseUrl="https://twitter.com"
      fallbackHeight={defaultPlaceholderHeight}
      webViewProps={{
        ...webViewProps,
        onLoad: (event) => {
          twitterTweetEmbedProps?.onLoad?.();
          webViewProps?.onLoad?.(event);
        },
      }}
    />
  );
};
