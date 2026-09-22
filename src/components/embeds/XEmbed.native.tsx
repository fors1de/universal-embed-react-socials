import { useEffect, useMemo } from 'react';
import { NativeModules, Platform } from 'react-native';
import { getXPostId } from '../../utils/urls';
import { embedIframeTitle } from '../../utils/iframeTitle';
import { resolveTwitterLang } from '../../utils/twitterLang';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { xEmbedHtml } from './embedHtml';
import { NativeSocialEmbed } from './NativeSocialEmbed';
import type { XEmbedProps } from './XEmbed.types';

export type { TwitterTweetEmbedProps, XEmbedProps } from './XEmbed.types';

const defaultPlaceholderHeight = 560;

/** Device language. `navigator.language` is missing or stuck on `en-US` in React Native. */
const deviceLocale = (): string | undefined => {
  const fromI18n = NativeModules.I18nManager?.localeIdentifier;
  if (typeof fromI18n === 'string' && fromI18n) {
    return fromI18n;
  }
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    const apple = settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
    if (typeof apple === 'string' && apple) {
      return apple;
    }
  }
  return undefined;
};

export const XEmbed = ({
  twitterTweetEmbedProps,
  placeholderText = 'View post on X',
  webViewProps,
  onError,
  embedDisabled,
  iframeTitle,
  locale,
  ...props
}: XEmbedProps) => {
  const postId = twitterTweetEmbedProps?.tweetId || getXPostId(props.url);
  const widgetLang = resolveTwitterLang(locale ?? twitterTweetEmbedProps?.locale ?? deviceLocale());
  const reportError = useEmbedOnError(onError, props.url);
  useEffect(() => {
    if (!postId && !embedDisabled) {
      reportError('invalid-url');
    }
  }, [embedDisabled, postId, reportError]);
  const html = useMemo(
    () => (postId ? xEmbedHtml({ postId, lang: widgetLang }) : undefined),
    [postId, widgetLang],
  );
  return (
    <NativeSocialEmbed
      {...props}
      embedDisabled={embedDisabled || !postId}
      placeholderText={placeholderText}
      html={html}
      iframeTitle={embedIframeTitle('X', { title: iframeTitle, id: postId })}
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
