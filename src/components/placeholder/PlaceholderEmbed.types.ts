import type { CSSProperties, ReactNode } from 'react';
import type { EmbedStyle } from '../../types';

export interface PlaceholderEmbedProps {
  url: string;
  placeholderText?: string;
  imageUrl?: string;
  spinner?: ReactNode;
  spinnerDisabled?: boolean;
  allowJavaScriptUrls?: boolean;
  className?: string;
  style?: EmbedStyle | CSSProperties;
}

/** Overrides for the default placeholder. `url` is supplied by the embed. */
export type PlaceholderEmbedOptions = Omit<PlaceholderEmbedProps, 'url'> & {
  url?: string;
};
