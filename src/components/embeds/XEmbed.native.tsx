import { useEffect, useMemo } from 'react';
import { getXPostId } from '../../utils/urls';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { xEmbedHtml } from './embedHtml';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import type { XEmbedProps } from './XEmbed.types';

export type { TwitterTweetEmbedProps, XEmbedProps } from './XEmbed.types';

const defaultPlaceholderHeight = 560;

export const XEmbed = ({
  twitterTweetEmbedProps,
  placeholderText = 'View post on X',
  webViewProps,
  onError,
  embedDisabled,
  ...props
}: XEmbedProps) => {
  const postId = twitterTweetEmbedProps?.tweetId || getXPostId(props.url);
  const reportError = useEmbedOnError(onError, props.url);
  useEffect(() => {
    if (!postId && !embedDisabled) {
      reportError('invalid-url');
    }
  }, [embedDisabled, postId, reportError]);
  const html = useMemo(() => (postId ? xEmbedHtml({ postId }) : undefined), [postId]);
  return (
    <NativeSocialEmbed
      {...props}
      embedDisabled={embedDisabled || !postId}
      placeholderText={placeholderText}
      html={html}
      baseUrl="https://twitter.com"
      fallbackHeight={defaultPlaceholderHeight}
      onError={onError}
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
