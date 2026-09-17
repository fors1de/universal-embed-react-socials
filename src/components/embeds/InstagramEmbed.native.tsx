import { useEffect, useMemo } from 'react';
import { DEFAULT_INSTAGRAM_API_VERSION, normalizeInstagramApiVersion } from '../../utils/apiVersion';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { getCleanInstagramUrl } from '../../utils/urls';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { instagramEmbedHtml } from './embedHtml';
import {
  INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT,
  INSTAGRAM_PLACEHOLDER_HEIGHT,
  type InstagramEmbedProps,
} from './InstagramEmbed.types';
import { NativeSocialEmbed } from './NativeSocialEmbed';

export {
  INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT,
  INSTAGRAM_PLACEHOLDER_HEIGHT,
  type InstagramEmbedProps,
};

export const InstagramEmbed = ({
  captioned = false,
  apiVersion = DEFAULT_INSTAGRAM_API_VERSION,
  placeholderText = 'View post on Instagram',
  onError,
  embedDisabled,
  iframeTitle,
  ...props
}: InstagramEmbedProps) => {
  const resolvedVersion = normalizeInstagramApiVersion(apiVersion);
  const cleanUrl = getCleanInstagramUrl(props.url);
  const reportError = useEmbedOnError(onError, props.url);
  useEffect(() => {
    if (!cleanUrl && !embedDisabled) {
      reportError('invalid-url');
    }
  }, [cleanUrl, embedDisabled, reportError]);
  const html = useMemo(
    () =>
      cleanUrl ? instagramEmbedHtml({ url: cleanUrl, apiVersion: resolvedVersion, captioned }) : undefined,
    [captioned, cleanUrl, resolvedVersion],
  );
  return (
    <NativeSocialEmbed
      {...props}
      url={cleanUrl ?? props.url}
      embedDisabled={embedDisabled || !cleanUrl}
      placeholderText={placeholderText}
      html={html}
      iframeTitle={embedIframeTitle('Instagram', { title: iframeTitle, url: cleanUrl ?? props.url })}
      baseUrl="https://www.instagram.com"
      fallbackHeight={captioned ? INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT : INSTAGRAM_PLACEHOLDER_HEIGHT}
      onError={onError}
    />
  );
};
