import type { CSSProperties, ReactNode } from 'react';
import { Box } from '../../host';
import type { EmbedPlaceholder, EmbedStyle } from '../../types';
import { PlaceholderEmbed } from './PlaceholderEmbed';
import type { PlaceholderEmbedOptions } from './PlaceholderEmbed.types';

export interface ResolveEmbedPlaceholderOptions {
  placeholder?: EmbedPlaceholder;
  placeholderText?: string;
  placeholderImageUrl?: string;
  placeholderSpinner?: ReactNode;
  placeholderSpinnerDisabled?: boolean;
  placeholderProps?: PlaceholderEmbedOptions;
  placeholderWidth?: string | number;
  placeholderHeight?: string | number;
  placeholderStyle?: EmbedStyle;
  placeholderDisabled?: boolean;
  url?: string;
  extraStyle?: EmbedStyle;
  /** Current embed box size. Used when the user does not set a placeholder size. */
  embedWidth?: string | number;
  embedHeight?: string | number;
  /** Provider default size when the embed has not measured yet. */
  providerWidth?: string | number;
  providerHeight?: string | number;
  allowJavaScriptUrls?: boolean;
}

const placeholderBoxStyle = ({
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderProps,
  extraStyle,
  embedWidth,
  embedHeight,
  providerWidth,
  providerHeight,
}: ResolveEmbedPlaceholderOptions): CSSProperties => ({
  boxSizing: 'border-box',
  maxWidth: '100%',
  ...(extraStyle as CSSProperties),
  width:
    placeholderWidth ??
    embedWidth ??
    providerWidth ??
    (extraStyle as CSSProperties | undefined)?.width ??
    '100%',
  height:
    placeholderHeight ??
    embedHeight ??
    providerHeight ??
    (extraStyle as CSSProperties | undefined)?.height ??
    '100%',
  ...(placeholderStyle as CSSProperties),
  ...(placeholderProps?.style as CSSProperties),
});

export const resolveEmbedPlaceholder = (options: ResolveEmbedPlaceholderOptions): ReactNode => {
  const {
    url,
    placeholderText,
    placeholder,
    placeholderDisabled,
    placeholderImageUrl,
    placeholderSpinner,
    placeholderSpinnerDisabled,
    placeholderProps,
    allowJavaScriptUrls,
  } = options;
  if (placeholderDisabled) {
    return null;
  }

  const boxStyle = placeholderBoxStyle(options);
  const fillStyle: CSSProperties = { width: '100%', height: '100%' };
  if (placeholder !== undefined) {
    const custom = typeof placeholder === 'function' ? placeholder() : placeholder;
    if (custom == null || custom === false) {
      return null;
    }
    return (
      <Box style={{ ...boxStyle, overflow: 'hidden', ...fillStyle }}>{custom}</Box>
    );
  }

  return (
    <PlaceholderEmbed
      url={url}
      imageUrl={placeholderImageUrl}
      placeholderText={placeholderText}
      spinner={placeholderSpinner}
      spinnerDisabled={placeholderSpinnerDisabled}
      allowJavaScriptUrls={allowJavaScriptUrls}
      {...placeholderProps}
      style={{ ...fillStyle, ...boxStyle }}
    />
  );
};

export const resolveNativeEmbedPlaceholder = ({
  height,
  fallbackHeight,
  extraStyle,
  ...options
}: ResolveEmbedPlaceholderOptions & {
  height?: string | number;
  fallbackHeight: number;
}): ReactNode =>
  resolveEmbedPlaceholder({
    ...options,
    extraStyle,
    embedWidth: '100%',
    embedHeight: '100%',
    providerHeight: height ?? fallbackHeight,
  });
