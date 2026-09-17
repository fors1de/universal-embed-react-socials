import { Image, Linking, Pressable, Text, View } from 'react-native';
import { isJavaScriptUrl, isOpenableHref } from '../../utils/urls';
import { BorderSpinner } from './parts/BorderSpinner';
import type { PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export type { PlaceholderEmbedOptions, PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export const PlaceholderEmbed = ({
  url,
  placeholderText = 'View post',
  imageUrl,
  imageAlt,
  spinner = <BorderSpinner />,
  allowJavaScriptUrls = true,
  spinnerDisabled,
  style,
}: PlaceholderEmbedProps) => {
  if (url && isJavaScriptUrl(url) && !allowJavaScriptUrls) {
    console.warn(`PlaceholderEmbed has blocked a javascript: URL as a security precaution`);
    return null;
  }

  const openable = isOpenableHref(url);
  const body = (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: imageUrl ? 'flex-start' : 'center' }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          accessible={!!imageAlt}
          accessibilityLabel={imageAlt || undefined}
          accessibilityRole={imageAlt ? 'image' : undefined}
          accessibilityElementsHidden={!imageAlt}
          importantForAccessibility={imageAlt ? 'yes' : 'no-hide-descendants'}
        />
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}>
          {!spinnerDisabled && spinner}
          {!!placeholderText && (
            <Text style={{ color: '#000000', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 16 }}>
              {placeholderText}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const boxStyle = [
    {
      overflow: 'hidden' as const,
      borderWidth: 1,
      borderColor: '#dee2e6',
      backgroundColor: '#ffffff',
      position: 'relative' as const,
    },
    style,
  ];

  if (!openable || !url) {
    return (
      <View
        style={boxStyle}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={placeholderText}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={boxStyle}
      accessibilityRole="link"
      accessibilityLabel={placeholderText}
      accessibilityHint="Opens in browser"
    >
      {body}
    </Pressable>
  );
};
