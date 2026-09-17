import { Box, EmbedImage, EmbedLink, Txt } from '../../host';
import { classNames } from '../../utils/classNames';
import { isJavaScriptUrl } from '../../utils/urls';
import { EmbedStyle } from '../embeds/EmbedStyle';
import { BorderSpinner } from './parts/BorderSpinner';
import { EngagementIconsPlaceholder } from './parts/EngagementIconsPlaceholder';
import { ProfilePlaceholder } from './parts/ProfilePlaceholder';
import type { PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export type { PlaceholderEmbedOptions, PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export const PlaceholderEmbed = ({
  url,
  placeholderText = 'View post',
  imageUrl,
  spinner = <BorderSpinner />,
  allowJavaScriptUrls = true,
  spinnerDisabled,
  className,
  style,
}: PlaceholderEmbedProps) => {
  if (isJavaScriptUrl(url) && !allowJavaScriptUrls) {
    console.warn(`PlaceholderEmbed has blocked a javascript: URL as a security precaution`);
    return null;
  }

  return (
    <Box
      className={classNames(className)}
      style={{
        overflow: 'hidden',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#dee2e6',
        backgroundColor: '#ffffff',
        borderRadius: 0,
        boxSizing: 'border-box',
        position: 'relative',
        ...style,
      }}
    >
      <EmbedStyle />
      <EmbedLink
        href={url}
        style={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: typeof style?.height === 'number' ? undefined : 220,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {!imageUrl && (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 16,
              paddingBottom: 16,
              flexShrink: 0,
              backgroundColor: '#ffffff',
            }}
          >
            <ProfilePlaceholder />
          </Box>
        )}
        {!imageUrl && (
          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 8,
            }}
          >
            {!spinnerDisabled && spinner}
            {!!placeholderText && (
              <Txt
                style={{
                  color: '#000000',
                  fontFamily: 'Arial,sans-serif',
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontWeight: '600',
                  lineHeight: '18px',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                {placeholderText}
              </Txt>
            )}
          </Box>
        )}
        {imageUrl && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '100%',
              width: '100%',
            }}
          >
            {typeof style?.height !== 'undefined' ? (
              <Box style={{ width: '100%', height: '100%', marginBottom: 40 }}>
                <EmbedImage src={imageUrl} style={{ width: '100%', height: '100%' }} />
              </Box>
            ) : (
              <Box style={{ width: '100%', marginBottom: 40 }}>
                <EmbedImage src={imageUrl} style={{ width: '100%' }} />
              </Box>
            )}
          </Box>
        )}
        <Box
          style={{
            height: 40,
            width: '100%',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          {!imageUrl && <EngagementIconsPlaceholder style={{ marginLeft: 16 }} />}
          {imageUrl && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: 16,
              }}
            >
              <Txt
                style={{
                  color: '#0095f6',
                  fontWeight: '600',
                  fontFamily: 'Arial,sans-serif',
                  fontSize: 14,
                  fontStyle: 'normal',
                  marginLeft: 16,
                }}
              >
                {placeholderText}
              </Txt>
              {!spinnerDisabled && <Box style={{ marginRight: 16 }}>{spinner}</Box>}
            </Box>
          )}
        </Box>
      </EmbedLink>
    </Box>
  );
};
