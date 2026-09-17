import { useEffect, useId, useRef, useState } from 'react';
import { Box } from '../../host';
import { useAutoEmbedHeight } from '../../hooks/useEmbedHeight';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { EMBED_GIVE_UP_MS } from '../../utils/embedLoad';
import { ensureScript } from '../../utils/ensureScript';
import { useFrame } from '../../hooks/useFrame';
import { placeholderOverlayStyle, resolveEmbedFrame, resolveEmbedMaxWidth } from '../../utils/style';
import { Subs } from '../../utils/subs';
import { getXPostId } from '../../utils/urls';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { EmbedShell } from './EmbedShell';
import type { XEmbedProps } from './XEmbed.types';

export type { TwitterTweetEmbedProps, XEmbedProps } from './XEmbed.types';

const defaultPlaceholderHeight = 560;
const officialEmbedWidth = 550;
const borderRadius = 12;

export const XEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'View post on X',
  placeholderImageUrl,
  placeholderSpinner,
  placeholderSpinnerDisabled = false,
  placeholderProps,
  placeholder,
  placeholderWidth,
  placeholderHeight,
  placeholderStyle,
  placeholderDisabled,
  embedDisabled: embedDisabledProp = false,
  lazy = false,
  twitterTweetEmbedProps,
  onError,
  className,
  style,
}: XEmbedProps) => {
  const postId = twitterTweetEmbedProps?.tweetId ?? getXPostId(url);
  const onLoad = twitterTweetEmbedProps?.onLoad;
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const reportError = useEmbedOnError(onError, url);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const embedId = useId();
  const frm = useFrame();
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const { ref: boxRef, disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy);
  const { measured: observedHeight, containerRef } = useAutoEmbedHeight({
    enabled: !embedDisabled && height == null,
    resetKey: postId,
  });
  const boxStyle = {
    width: '100%' as const,
    maxWidth:
      typeof resolvedMaxWidth === 'number'
        ? Math.min(resolvedMaxWidth, officialEmbedWidth)
        : officialEmbedWidth,
  };

  useEffect(() => {
    setReady(false);
    setFailed(false);
    if (embedDisabled) {
      return;
    }
    const win = frm.window as typeof globalThis & {
      twttr?: { widgets?: { load?: (el?: Element) => void } };
    };
    const doc = frm.document;
    if (!doc) {
      return;
    }

    if (!win.twttr?.widgets?.load) {
      ensureScript(doc, 'twitter-widgets-script', 'https://platform.twitter.com/widgets.js');
    }

    let processed = false;
    const subs = new Subs();
    const cleanup = subs.createCleanup();
    subs.setInterval(() => {
      if (!processed && win.twttr?.widgets?.load) {
        win.twttr.widgets.load((doc.getElementById(embedId) as Element | undefined) ?? undefined);
        processed = true;
      }
      const root = doc.getElementById(embedId);
      if (root?.querySelector('iframe')) {
        setReady(true);
        onLoadRef.current?.();
        cleanup();
      }
    }, 50);
    subs.setTimeout(() => {
      setFailed(true);
      reportError('unavailable');
      cleanup();
    }, EMBED_GIVE_UP_MS);
    return cleanup;
  }, [embedId, frm.document, frm.window, postId, embedDisabled]);

  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url,
    placeholderText,
    placeholder,
    placeholderDisabled,
    placeholderImageUrl,
    placeholderSpinner,
    placeholderSpinnerDisabled: placeholderSpinnerDisabled || failed,
    placeholderProps,
    placeholderWidth,
    placeholderHeight,
    placeholderStyle,
    extraStyle: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#c9d4d9',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: officialEmbedWidth,
    providerHeight: defaultPlaceholderHeight,
  });
  const { frameHeight, showPlaceholder } = resolveEmbedFrame({
    ready: !embedDisabled && ready,
    measuredHeight: observedHeight,
    fallbackHeight: defaultPlaceholderHeight,
    height,
  });

  return (
    <div ref={boxRef} style={boxStyle}>
      <EmbedShell
        className={className}
        extraClassName="rsme-twitter-embed"
        width="100%"
        height={frameHeight}
        borderRadius={borderRadius}
        style={{ position: 'relative', ...style }}
      >
        <div ref={containerRef} style={{ width: '100%' }}>
          {embedDisabled ? null : (
            <Box id={embedId} key={postId}>
              <blockquote className="twitter-tweet" data-width={officialEmbedWidth}>
                <a href={`https://twitter.com/i/status/${postId}`}>{placeholderText}</a>
              </blockquote>
            </Box>
          )}
        </div>
        {showPlaceholder && !placeholderDisabled && resolvedPlaceholder != null ? (
          <Box style={placeholderOverlayStyle}>{resolvedPlaceholder}</Box>
        ) : null}
      </EmbedShell>
    </div>
  );
};
