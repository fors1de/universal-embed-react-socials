import { useMemo } from 'react';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { LINKEDIN_DESIGN_HEIGHT, linkedinEmbedHtml } from './embedHtml';
import type { LinkedInEmbedProps } from './LinkedInEmbed.types';
import { NativeSocialEmbed } from './NativeSocialEmbed';

export type { LinkedInEmbedProps } from './LinkedInEmbed.types';

export const LinkedInEmbed = ({
  url,
  postUrl,
  height,
  placeholderText = 'View post on LinkedIn',
  iframeTitle,
  ...props
}: LinkedInEmbedProps) => {
  const resolvedTitle = embedIframeTitle('LinkedIn', { title: iframeTitle, url: postUrl ?? url });
  const html = useMemo(
    () => (height == null ? linkedinEmbedHtml({ url, title: resolvedTitle }) : undefined),
    [height, resolvedTitle, url],
  );
  return (
    <NativeSocialEmbed
      {...props}
      url={url}
      height={height}
      placeholderText={placeholderText}
      placeholderUrl={postUrl ?? url}
      iframeTitle={resolvedTitle}
      {...(html != null ? { html, autoHeight: true } : { uri: url })}
      baseUrl="https://www.linkedin.com"
      fallbackHeight={LINKEDIN_DESIGN_HEIGHT}
    />
  );
};
