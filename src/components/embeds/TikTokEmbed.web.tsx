import { useEffect, useId, useState, type ReactElement } from 'react';
import { Box, IFrame } from '../../host';
import { useAutoEmbedHeight, useResponsiveEmbedBox } from '../../hooks/useEmbedHeight';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { useFrame } from '../../hooks/useFrame';
import {
  aspectRatioHeight,
  collapsedEmbedStyle,
  embedMaxWidthStyle,
  embedScaleStyle,
  placeholderOverlayStyle,
  resolveEmbedFrame,
  resolveEmbedMaxWidth,
} from '../../utils/style';
import { Subs } from '../../utils/subs';
import { getTikTokVideoId } from '../../utils/urls';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import {
  TIKTOK_PLAYER_ASPECT_RATIO,
  TIKTOK_PLAYER_FALLBACK_HEIGHT,
  buildTikTokPlayerSrc,
  usesTikTokPlayer,
  type TikTokEmbedProps,
} from './TikTokEmbed.types';

export type { TikTokEmbedProps, TikTokPlayerFlag, TikTokPlayerVars } from './TikTokEmbed.types';

const defaultPlaceholderHeight = 739;
const officialEmbedWidth = 325;
const tiktokContentMinHeight = 500;
const borderRadius = 8;

const PROCESS_EMBED_STAGE = 'process-embed';
const CONFIRM_EMBED_SUCCESS_STAGE = 'confirm-embed-success';
const RETRYING_STAGE = 'retrying';
const EMBED_SUCCESS_STAGE = 'embed-success';

const TikTokPlayerEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'View post on TikTok',
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
  tikTokProps,
  className,
  style,
}: TikTokEmbedProps): ReactElement => {
  const { ref: lazyRef, disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (embedDisabled) {
      setReady(false);
    }
  }, [embedDisabled]);
  const videoId = getTikTokVideoId(url);
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const autoHeight = height == null;
  const aspectFallback = aspectRatioHeight(
    resolvedMaxWidth,
    TIKTOK_PLAYER_ASPECT_RATIO,
    TIKTOK_PLAYER_FALLBACK_HEIGHT,
  );
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
    extraStyle: { borderRadius },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: resolvedMaxWidth,
    providerHeight: typeof height === 'number' ? height : aspectFallback,
  });
  const hasPlaceholder = resolvedPlaceholder != null;
  const reserveFrame = ready || hasPlaceholder || embedDisabled;

  return (
    <div ref={lazyRef} style={{ ...embedMaxWidthStyle(resolvedMaxWidth), ...collapsedEmbedStyle(!reserveFrame) }}>
      <EmbedShell
        className={className}
        extraClassName="rsme-tiktok-embed"
        width="100%"
        height={!reserveFrame ? 0 : autoHeight ? undefined : height}
        borderRadius={borderRadius}
        style={{
          ...(autoHeight && reserveFrame ? { aspectRatio: '9 / 16' } : {}),
          ...collapsedEmbedStyle(!reserveFrame),
          ...style,
        }}
      >
        <MediaFrame showPlaceholder={(!ready || embedDisabled) && hasPlaceholder} placeholder={resolvedPlaceholder}>
          {embedDisabled ? null : (
          <Box style={{ width: '100%', height: '100%', visibility: ready ? 'visible' : 'hidden' }}>
            <IFrame
              src={buildTikTokPlayerSrc(videoId, tikTokProps)}
              width="100%"
              height="100%"
              allow="fullscreen; autoplay; encrypted-media"
              allowFullScreen
              title="TikTok embed"
              onLoad={() => setReady(true)}
            />
          </Box>
          )}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};

const TikTokOEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'View post on TikTok',
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
  scriptLoadDisabled = false,
  retryDelay = 5000,
  retryDisabled = false,
  frame = undefined,
  debug = false,
  className,
  style,
}: TikTokEmbedProps): ReactElement => {
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const { boxRef, scale, boxStyle } = useResponsiveEmbedBox(officialEmbedWidth, resolvedMaxWidth);
  const { disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy, boxRef);
  const [stage, setStage] = useState(PROCESS_EMBED_STAGE);
  const placeholderId = useId();
  const [processTime, setProcessTime] = useState(0);
  const embedContainerKey = `${placeholderId}-${processTime}`;
  const frm = useFrame(frame);
  const embedId = getTikTokVideoId(url);
  const { height: observedHeight, containerRef } = useAutoEmbedHeight({
    enabled: !embedDisabled && height == null,
  });

  useEffect(() => {
    if (embedDisabled) {
      return;
    }
    debug && console.log(`[${new Date().toISOString()}]: ${stage}`);
  }, [debug, embedDisabled, stage]);

  useEffect(() => {
    if (embedDisabled || stage !== PROCESS_EMBED_STAGE || !frm.document || scriptLoadDisabled) {
      return;
    }
    const scriptId = 'tiktok-embed-script';
    const prevScript = frm.document.getElementById(scriptId);
    if (prevScript) {
      prevScript.remove();
    }
    const scriptElement = frm.document.createElement('script');
    scriptElement.setAttribute('src', `https://www.tiktok.com/embed.js?t=${Date.now()}`);
    scriptElement.setAttribute('id', scriptId);
    frm.document.head.appendChild(scriptElement);
    setStage(CONFIRM_EMBED_SUCCESS_STAGE);
  }, [scriptLoadDisabled, stage, frm.document, embedDisabled]);

  useEffect(() => {
    if (embedDisabled) {
      return;
    }
    const subs = new Subs();
    if (stage === CONFIRM_EMBED_SUCCESS_STAGE) {
      subs.setInterval(() => {
        if (frm.document?.querySelector('.tiktok-embed-container iframe')) {
          setStage(EMBED_SUCCESS_STAGE);
        }
      }, 50);
      if (!retryDisabled) {
        subs.setTimeout(() => {
          setStage(RETRYING_STAGE);
        }, retryDelay);
      }
    }
    return subs.createCleanup();
  }, [placeholderId, retryDelay, retryDisabled, stage, frm.document, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || stage !== RETRYING_STAGE) {
      return;
    }
    setProcessTime(Date.now());
    setStage(PROCESS_EMBED_STAGE);
  }, [stage, embedDisabled]);

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
      borderColor: 'rgba(22,24,35,0.12)',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: officialEmbedWidth,
    providerHeight: defaultPlaceholderHeight,
  });
  const embedReady = !embedDisabled && stage === EMBED_SUCCESS_STAGE;
  const videoHeight =
    observedHeight != null && observedHeight >= tiktokContentMinHeight ? observedHeight : undefined;
  const { frameHeight, showPlaceholder } = resolveEmbedFrame({
    ready: embedReady,
    measuredHeight: videoHeight,
    fallbackHeight: defaultPlaceholderHeight,
    scale,
    height,
  });

  return (
    <div ref={boxRef} style={boxStyle}>
    <EmbedShell className={className} extraClassName="rsme-tiktok-embed" width="100%" height={frameHeight} borderRadius={borderRadius} style={{ position: 'relative', ...style }}>
      <div ref={containerRef} style={embedScaleStyle(scale, officialEmbedWidth)}>
      {embedDisabled ? null : (
      <Box className="tiktok-embed-container">
        <blockquote key={embedContainerKey} className="tiktok-embed" cite={url} data-video-id={embedId}>
          <section>
            <a href={url}>{placeholderText}</a>
          </section>
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

export const TikTokEmbed = (props: TikTokEmbedProps): ReactElement => {
  if (usesTikTokPlayer(props.allowsFullscreenVideo, props.tikTokProps)) {
    return <TikTokPlayerEmbed {...props} />;
  }
  return <TikTokOEmbed {...props} />;
};
