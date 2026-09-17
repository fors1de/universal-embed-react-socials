import { useMemo } from 'react';
import { DEFAULT_FACEBOOK_API_VERSION, DEFAULT_FACEBOOK_LOCALE } from '../../utils/apiVersion';
import { isPercentage, resolveEmbedMaxWidth } from '../../utils/style';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { facebookEmbedHtml } from './embedHtml';
import type { FacebookEmbedProps } from './FacebookEmbed.types';
import { NativeSocialEmbed } from './NativeSocialEmbed';

export type { FacebookEmbedProps } from './FacebookEmbed.types';

const defaultPlaceholderHeight = 372;

export const FacebookEmbed = ({
  apiVersion = DEFAULT_FACEBOOK_API_VERSION,
  locale = DEFAULT_FACEBOOK_LOCALE,
  placeholderText = 'View post on Facebook',
  iframeTitle,
  ...props
}: FacebookEmbedProps) => {
  const resolvedMaxWidth = resolveEmbedMaxWidth(props.maxWidth);
  const resolvedWidth = isPercentage(resolvedMaxWidth) ? '100%' : resolvedMaxWidth;
  const html = useMemo(
    () => facebookEmbedHtml({ url: props.url, width: resolvedWidth, apiVersion, locale }),
    [apiVersion, locale, props.url, resolvedWidth],
  );
  return (
    <NativeSocialEmbed
      {...props}
      placeholderText={placeholderText}
      iframeTitle={embedIframeTitle('Facebook', { title: iframeTitle, url: props.url })}
      html={html}
      baseUrl="https://www.facebook.com"
      fallbackHeight={defaultPlaceholderHeight}
    />
  );
};
