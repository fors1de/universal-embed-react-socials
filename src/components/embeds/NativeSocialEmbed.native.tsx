import { useEffect, useMemo, useState } from 'react';
import { resolveEmbedMaxWidth } from '../../utils/style';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { resolveNativeEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { NativeEmbedView } from './NativeEmbedView';
import type { NativeSocialEmbedProps } from './NativeSocialEmbed.types';

export type { NativeSocialEmbedProps } from './NativeSocialEmbed.types';

export const NativeSocialEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText,
  placeholderImageUrl,
  placeholderSpinner,
  placeholderSpinnerDisabled,
  placeholderProps,
  placeholder,
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderDisabled,
  embedDisabled,
  lazy,
  style,
  webViewProps,
  openLinksInBrowser = true,
  fallbackHeight,
  placeholderUrl,
  iframeSandbox: _iframeSandbox,
  iframeTitle,
  onError,
  ...viewProps
}: NativeSocialEmbedProps) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [url]);
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const resolvedPlaceholder = useMemo(() => {
    if (placeholderDisabled) {
      return null;
    }
    return resolveNativeEmbedPlaceholder({
      placeholderText,
      placeholderImageUrl,
      placeholderSpinner,
      placeholderSpinnerDisabled: placeholderSpinnerDisabled || failed,
      placeholderProps,
      placeholder,
      placeholderWidth,
      placeholderHeight,
      placeholderStyle,
      placeholderDisabled,
      url: placeholderUrl ?? url,
      height,
      fallbackHeight,
    });
  }, [
    fallbackHeight,
    height,
    placeholder,
    placeholderDisabled,
    placeholderHeight,
    placeholderImageUrl,
    placeholderProps,
    placeholderSpinner,
    placeholderSpinnerDisabled,
    placeholderStyle,
    placeholderText,
    placeholderUrl,
    placeholderWidth,
    failed,
    url,
  ]);

  return (
    <NativeEmbedView
      {...viewProps}
      url={url}
      width={resolvedMaxWidth}
      height={height}
      style={style}
      fallbackHeight={fallbackHeight}
      placeholder={resolvedPlaceholder}
      placeholderDisabled={placeholderDisabled}
      embedDisabled={embedDisabled}
      lazy={lazy}
      openLinksInBrowser={openLinksInBrowser}
      webViewProps={webViewProps}
      iframeTitle={iframeTitle ?? embedIframeTitle('Embed', { url })}
      onError={(error) => {
        setFailed(true);
        onError?.(error);
      }}
    />
  );
};
