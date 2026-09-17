import { useEffect, useMemo, useState } from 'react';
import { IFrame } from '../../host';
import { useAutoEmbedHeight, useResponsiveEmbedBox } from '../../hooks/useEmbedHeight';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { DEFAULT_FACEBOOK_API_VERSION, DEFAULT_FACEBOOK_LOCALE } from '../../utils/apiVersion';
import { embedScaleStyle, isPercentage, resolveEmbedMaxWidth } from '../../utils/style';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { facebookEmbedHtml } from './embedHtml';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import type { FacebookEmbedProps } from './FacebookEmbed.types';

export type { FacebookEmbedProps } from './FacebookEmbed.types';

const defaultEmbedWidth = 550;
const minPluginWidth = 350;
const maxPluginWidth = 750;
const defaultPlaceholderHeight = 372;
const borderRadius = 3;
const FACEBOOK_CHROME = 148;
const FACEBOOK_CONTENT_MIN = 240;
const SDK_FALLBACK_MS = 8000;

const clampFacebookWidth = (width: number) => Math.min(maxPluginWidth, Math.max(minPluginWidth, width));

const facebookPluginHeight = (width: number): number =>
  Math.max(defaultPlaceholderHeight, Math.round(width * (9 / 16) + FACEBOOK_CHROME));

const buildFacebookPluginSrc = (url: string, width: number, height: number, locale: string) => {
  const params = new URLSearchParams({
    href: url,
    show_text: 'true',
    width: String(width),
    height: String(height),
    locale,
  });
  return `https://www.facebook.com/plugins/post.php?${params.toString()}`;
};

export const FacebookEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'View post on Facebook',
  placeholderImageUrl,
  placeholderSpinner,
  placeholderSpinnerDisabled = false,
  placeholderProps,
  placeholder,
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderDisabled = false,
  embedDisabled: embedDisabledProp = false,
  lazy = false,
  apiVersion = DEFAULT_FACEBOOK_API_VERSION,
  locale = DEFAULT_FACEBOOK_LOCALE,
  className,
  style,
}: FacebookEmbedProps) => {
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const percentageWidth = isPercentage(resolvedMaxWidth);
  const percentageHeight = isPercentage(height);
  const pluginWidth =
    percentageWidth || typeof resolvedMaxWidth !== 'number'
      ? defaultEmbedWidth
      : clampFacebookWidth(resolvedMaxWidth);
  const { boxRef, scale, boxStyle } = useResponsiveEmbedBox(pluginWidth, resolvedMaxWidth);
  const { disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy, boxRef);
  const [usePluginFallback, setUsePluginFallback] = useState(false);
  const [pluginReady, setPluginReady] = useState(false);
  const embedHtml = useMemo(
    () => facebookEmbedHtml({ url, width: pluginWidth, apiVersion, locale }),
    [apiVersion, locale, pluginWidth, url],
  );
  const [frameSrc, setFrameSrc] = useState<string | undefined>();
  const fallbackHeight = facebookPluginHeight(pluginWidth);
  const autoHeight = height == null;
  const { measured, iframeRef } = useAutoEmbedHeight({
    enabled: !embedDisabled && !usePluginFallback && !!frameSrc,
    measureSrcDoc: !embedDisabled && !usePluginFallback && !!frameSrc,
    measureSelector: 'iframe',
    resetKey: url,
  });
  const contentHeight =
    measured != null && measured >= FACEBOOK_CONTENT_MIN ? measured : undefined;
  const ready = !embedDisabled && (usePluginFallback ? pluginReady : contentHeight != null);

  useEffect(() => {
    if (embedDisabled) {
      setFrameSrc(undefined);
      setUsePluginFallback(false);
      setPluginReady(false);
      return;
    }
    const blob = new Blob([embedHtml], { type: 'text/html' });
    const next = URL.createObjectURL(blob);
    setFrameSrc(next);
    return () => URL.revokeObjectURL(next);
  }, [embedHtml, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || !autoHeight || ready || usePluginFallback) {
      return;
    }
    const timer = window.setTimeout(() => setUsePluginFallback(true), SDK_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [autoHeight, ready, embedDisabled, usePluginFallback]);

  const frameHeight =
    typeof height === 'number' ? height : (contentHeight ?? fallbackHeight);
  const shellHeight = percentageHeight
    ? '100%'
    : Math.round(frameHeight * (typeof height === 'number' ? 1 : scale));
  const showPlaceholder = !ready && !placeholderDisabled;

  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url,
    placeholderText,
    placeholder,
    placeholderDisabled,
    placeholderImageUrl,
    placeholderSpinner,
    placeholderSpinnerDisabled,
    placeholderProps,
    placeholderWidth,
    placeholderHeight,
    placeholderStyle,
    extraStyle: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#dee2e6',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: pluginWidth,
    providerHeight: fallbackHeight,
  });
  const facebookFrameProps = {
    width: pluginWidth,
    allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
    allowFullScreen: true,
    title: 'Facebook embed',
    style: embedScaleStyle(scale, pluginWidth),
  };

  return (
    <div ref={boxRef} style={boxStyle}>
      <EmbedShell
        className={className}
        extraClassName="rsme-facebook-embed"
        width="100%"
        height={shellHeight}
        borderRadius={borderRadius}
        style={style}
      >
        <MediaFrame showPlaceholder={showPlaceholder} placeholder={resolvedPlaceholder}>
          {embedDisabled ? null : usePluginFallback ? (
            <IFrame
              src={buildFacebookPluginSrc(url, pluginWidth, fallbackHeight, locale)}
              height={fallbackHeight}
              onLoad={() => setPluginReady(true)}
              {...facebookFrameProps}
            />
          ) : frameSrc ? (
            <IFrame
              key={url}
              iframeRef={iframeRef}
              src={frameSrc}
              height={frameHeight}
              {...facebookFrameProps}
            />
          ) : null}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};
