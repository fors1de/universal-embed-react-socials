import { useEffect, useId, useState, type ReactElement } from 'react';
import { Box } from '../../host';
import { useAutoEmbedHeight, useResponsiveEmbedBox } from '../../hooks/useEmbedHeight';
import { useFrame } from '../../hooks/useFrame';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { DEFAULT_INSTAGRAM_API_VERSION, normalizeInstagramApiVersion } from '../../utils/apiVersion';
import { classNames } from '../../utils/classNames';
import { EMBED_FAILED_STAGE, EMBED_MAX_RETRIES } from '../../utils/embedLoad';
import { ensureScript } from '../../utils/ensureScript';
import { embedScaleStyle, resolveEmbedFrame, resolveEmbedMaxWidth } from '../../utils/style';
import { Subs } from '../../utils/subs';
import { getCleanInstagramUrl } from '../../utils/urls';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import {
  INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT,
  INSTAGRAM_PLACEHOLDER_HEIGHT,
  type InstagramEmbedProps,
  type InstagramEmbedWebProps,
} from './InstagramEmbed.types';

export {
  INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT,
  INSTAGRAM_PLACEHOLDER_HEIGHT,
  type InstagramEmbedProps,
  type InstagramEmbedWebProps,
};

const officialEmbedWidth = 550;
const borderRadius = 3;
const INSTAGRAM_SCRIPT_ID = 'instagram-embed-script';

const CHECK_SCRIPT_STAGE = 'check-script';
const LOAD_SCRIPT_STAGE = 'load-script';
const CONFIRM_SCRIPT_LOADED_STAGE = 'confirm-script-loaded';
const PROCESS_EMBED_STAGE = 'process-embed';
const CONFIRM_EMBED_SUCCESS_STAGE = 'confirm-embed-success';
const RETRYING_STAGE = 'retrying';
const EMBED_SUCCESS_STAGE = 'embed-success';

const instagramProcess = (win?: object) =>
  (win as { instgrm?: { Embeds?: { process?: () => void } } } | undefined)?.instgrm?.Embeds
    ?.process;

export const InstagramEmbed = ({
  url,
  maxWidth,
  height,
  placeholderText = 'View post on Instagram',
  captioned = false,
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
  apiVersion = DEFAULT_INSTAGRAM_API_VERSION,
  frame = undefined,
  debug = false,
  onError,
  className,
  style,
  id,
  testID,
}: InstagramEmbedProps & InstagramEmbedWebProps): ReactElement => {
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const { boxRef, scale, boxStyle } = useResponsiveEmbedBox(officialEmbedWidth, resolvedMaxWidth);
  const { disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy, boxRef);
  const resolvedVersion = normalizeInstagramApiVersion(apiVersion);
  const cleanUrlWithEndingSlash = getCleanInstagramUrl(url);
  const [stage, setStage] = useState(CHECK_SCRIPT_STAGE);
  const [retryCount, setRetryCount] = useState(0);
  const embedId = useId();
  const embedContainerKey = `${embedId}-${cleanUrlWithEndingSlash}-${retryCount}`;
  const frm = useFrame(frame);
  const reportError = useEmbedOnError(onError, url);
  const failed = stage === EMBED_FAILED_STAGE;

  useEffect(() => {
    setStage(CHECK_SCRIPT_STAGE);
    setRetryCount(0);
  }, [url, captioned, resolvedVersion, embedDisabled]);

  useEffect(() => {
    if (embedDisabled) {
      return;
    }
    debug && console.log(`[${new Date().toISOString()}]: ${stage}`);
  }, [debug, embedDisabled, stage]);

  useEffect(() => {
    if (embedDisabled || stage !== CHECK_SCRIPT_STAGE) {
      return;
    }
    if (!cleanUrlWithEndingSlash) {
      setStage(EMBED_FAILED_STAGE);
      reportError('invalid-url');
      return;
    }
    if (instagramProcess(frm.window)) {
      setStage(PROCESS_EMBED_STAGE);
    } else if (!scriptLoadDisabled) {
      setStage(LOAD_SCRIPT_STAGE);
    } else {
      console.error('Instagram embed script not found. Unable to process Instagram embed:', url);
      setStage(EMBED_FAILED_STAGE);
      reportError('script-missing');
    }
  }, [scriptLoadDisabled, stage, url, frm.window, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || stage !== LOAD_SCRIPT_STAGE || !frm.document) {
      return;
    }
    ensureScript(frm.document, INSTAGRAM_SCRIPT_ID, 'https://www.instagram.com/embed.js', () => {
      setStage(EMBED_FAILED_STAGE);
      reportError('script-missing');
    });
    setStage(CONFIRM_SCRIPT_LOADED_STAGE);
  }, [stage, frm.document, embedDisabled]);

  useEffect(() => {
    if (embedDisabled) {
      return;
    }
    const subs = new Subs();
    if (stage === CONFIRM_SCRIPT_LOADED_STAGE) {
      subs.setInterval(() => {
        if (instagramProcess(frm.window)) {
          setStage(PROCESS_EMBED_STAGE);
        }
      }, 50);
      subs.setTimeout(() => {
        setStage(EMBED_FAILED_STAGE);
        reportError('script-missing');
      }, retryDelay);
    }
    return subs.createCleanup();
  }, [stage, frm.window, embedDisabled, retryDelay]);

  useEffect(() => {
    if (embedDisabled || stage !== PROCESS_EMBED_STAGE) {
      return;
    }
    const process = instagramProcess(frm.window);
    if (process) {
      process();
      setStage(CONFIRM_EMBED_SUCCESS_STAGE);
    } else {
      console.error('Instagram embed script not found. Unable to process Instagram embed:', url);
      setStage(EMBED_FAILED_STAGE);
      reportError('script-missing');
    }
  }, [stage, frm.window, url, embedDisabled]);

  useEffect(() => {
    if (embedDisabled) {
      return;
    }
    const subs = new Subs();
    if (stage === CONFIRM_EMBED_SUCCESS_STAGE) {
      subs.setInterval(() => {
        if (frm.document && !frm.document.getElementById(embedId)) {
          setStage(EMBED_SUCCESS_STAGE);
        }
      }, 50);
      subs.setTimeout(() => {
        if (retryDisabled || retryCount >= EMBED_MAX_RETRIES) {
          setStage(EMBED_FAILED_STAGE);
          reportError('unavailable');
        } else {
          setStage(RETRYING_STAGE);
        }
      }, retryDelay);
    }
    return subs.createCleanup();
  }, [embedId, retryCount, retryDelay, retryDisabled, stage, frm.document, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || stage !== RETRYING_STAGE) {
      return;
    }
    setRetryCount((count) => count + 1);
    setStage(PROCESS_EMBED_STAGE);
  }, [stage, embedDisabled]);

  const fallbackHeight = captioned ? INSTAGRAM_CAPTIONED_PLACEHOLDER_HEIGHT : INSTAGRAM_PLACEHOLDER_HEIGHT;
  const { height: observedHeight, containerRef } = useAutoEmbedHeight({
    enabled: !embedDisabled && height == null,
    resetKey: url,
  });
  const embedReady = !embedDisabled && stage === EMBED_SUCCESS_STAGE;

  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url: cleanUrlWithEndingSlash,
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
      borderColor: '#dee2e6',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: officialEmbedWidth,
    providerHeight: fallbackHeight,
  });
  const { frameHeight, showPlaceholder } = resolveEmbedFrame({
    ready: embedReady,
    measuredHeight: observedHeight,
    fallbackHeight: resolvedPlaceholder != null ? fallbackHeight : 0,
    scale,
    height,
  });

  return (
    <div ref={boxRef} style={boxStyle}>
    <EmbedShell
      id={id}
      testID={testID}
      className={classNames(embedId, className)}
      extraClassName="rsme-instagram-embed"
      width="100%"
      height={frameHeight}
      borderRadius={borderRadius}
      style={style}
    >
      <MediaFrame showPlaceholder={showPlaceholder} placeholder={resolvedPlaceholder}>
      <div ref={containerRef} style={embedScaleStyle(scale, officialEmbedWidth)}>
      {embedDisabled || !cleanUrlWithEndingSlash ? null : (
      <Box key={embedContainerKey}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${cleanUrlWithEndingSlash}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version={resolvedVersion}
        data-instgrm-captioned={captioned ? captioned : undefined}
        data-width={officialEmbedWidth}
        style={{ width: 'calc(100% - 2px)' }}
      >
        <div id={embedId} className="instagram-media-pre-embed rsme-d-none">
          &nbsp;
        </div>
      </blockquote>
      </Box>
      )}
      </div>
      </MediaFrame>
    </EmbedShell>
    </div>
  );
};
