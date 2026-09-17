import { useMemo } from 'react';
import { pinterestEmbedHtml } from './embedHtml';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import type { PinterestEmbedProps } from './PinterestEmbed.types';

export type { PinterestEmbedProps } from './PinterestEmbed.types';

const officialEmbedHeight = 900;

export const PinterestEmbed = ({
  url,
  postUrl,
  placeholderText = 'View post on Pinterest',
  ...props
}: PinterestEmbedProps) => {
  const pinUrl = postUrl ?? url;
  const html = useMemo(() => pinterestEmbedHtml({ url: pinUrl, fillWidth: true }), [pinUrl]);
  return (
    <NativeSocialEmbed
      {...props}
      url={url}
      placeholderText={placeholderText}
      placeholderUrl={pinUrl}
      html={html}
      baseUrl="https://www.pinterest.com"
      fallbackHeight={officialEmbedHeight}
    />
  );
};
