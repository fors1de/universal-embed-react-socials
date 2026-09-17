import type { ReactElement } from 'react';
import type { PlaceholderEmbedOptions, PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export type { PlaceholderEmbedOptions, PlaceholderEmbedProps };

/** Platform implementations: `PlaceholderEmbed.web.tsx` / `PlaceholderEmbed.native.tsx`. */
export declare const PlaceholderEmbed: (props: PlaceholderEmbedProps) => ReactElement;
