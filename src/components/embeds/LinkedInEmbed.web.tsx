import { useEffect, useState } from 'react';
import { IFrame } from '../../host';
import { useResponsiveEmbedBox } from '../../hooks/useEmbedHeight';
import { useEmbedOnError } from '../../hooks/useEmbedOnError';
import { useLazyEmbed } from '../../hooks/useLazyEmbed';
import { EMBED_GIVE_UP_MS } from '../../utils/embedLoad';
import { embedScaleStyle, resolveEmbedFrame, resolveEmbedMaxWidth } from '../../utils/style';
import { resolveEmbedPlaceholder } from '../placeholder/resolveEmbedPlaceholder';
import { LINKEDIN_DESIGN_HEIGHT, LINKEDIN_DESIGN_WIDTH } from './embedHtml';
import { EmbedShell } from './EmbedShell';
import { MediaFrame } from './MediaFrame';
import type { LinkedInEmbedProps } from './LinkedInEmbed.types';

export type { LinkedInEmbedProps } from './LinkedInEmbed.types';

const borderRadius = 8;

export const LinkedInEmbed = ({
  url,
  postUrl,
  maxWidth,
  height,
  placeholderText = 'View post on LinkedIn',
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
  onError,
  className,
  style,
  id,
  testID,
}: LinkedInEmbedProps) => {
  const resolvedMaxWidth = resolveEmbedMaxWidth(maxWidth);
  const { boxRef, scale, boxStyle } = useResponsiveEmbedBox(LINKEDIN_DESIGN_WIDTH, resolvedMaxWidth);
  const { disabled: embedDisabled } = useLazyEmbed(embedDisabledProp, lazy, boxRef);
  const reportError = useEmbedOnError(onError, url);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [url, embedDisabled]);

  useEffect(() => {
    if (embedDisabled || ready) {
      return;
    }
    const id = window.setTimeout(() => {
      setFailed(true);
      reportError('timeout');
    }, EMBED_GIVE_UP_MS);
    return () => window.clearTimeout(id);
  }, [url, embedDisabled, ready]);
  const resolvedPlaceholder = resolveEmbedPlaceholder({
    url: postUrl ?? url,
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
      borderColor: 'rgba(0, 0, 0, 0.15)',
      borderRadius,
    },
    embedWidth: '100%',
    embedHeight: '100%',
    providerWidth: LINKEDIN_DESIGN_WIDTH,
    providerHeight: LINKEDIN_DESIGN_HEIGHT,
  });
  const { frameHeight: shellHeight, showPlaceholder } = resolveEmbedFrame({
    ready: !embedDisabled && ready,
    fallbackHeight: resolvedPlaceholder != null ? LINKEDIN_DESIGN_HEIGHT : 0,
    scale,
    height,
    waitForMeasure: false,
  });

  return (
    <div ref={boxRef} style={boxStyle}>
      <EmbedShell
        id={id}
        testID={testID}
        className={className}
        extraClassName="rsme-linkedin-embed"
        width="100%"
        height={shellHeight}
        borderRadius={borderRadius}
        style={style}
      >
        <MediaFrame showPlaceholder={showPlaceholder && !placeholderDisabled} placeholder={resolvedPlaceholder}>
          {embedDisabled ? null : (
          <IFrame
            key={url}
            className="linkedin-post"
            src={url}
            width={LINKEDIN_DESIGN_WIDTH}
            height={LINKEDIN_DESIGN_HEIGHT}
            onLoad={() => setReady(true)}
            onError={() => {
              setFailed(true);
              reportError('load-failed');
            }}
            title="LinkedIn embed"
            style={embedScaleStyle(scale, LINKEDIN_DESIGN_WIDTH)}
          />
          )}
        </MediaFrame>
      </EmbedShell>
    </div>
  );
};
