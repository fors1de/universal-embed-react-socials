import { Image, Linking, Pressable, Text, View } from 'react-native';
import { isJavaScriptUrl } from '../../utils/urls';
import { BorderSpinner } from './parts/BorderSpinner';
import type { PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export type { PlaceholderEmbedOptions, PlaceholderEmbedProps } from './PlaceholderEmbed.types';

export const PlaceholderEmbed = ({
  url,
  placeholderText = 'View post',
  imageUrl,
  spinner = <BorderSpinner />,
  allowJavaScriptUrls = true,
  spinnerDisabled,
  style,
}: PlaceholderEmbedProps) => {
  if (isJavaScriptUrl(url) && !allowJavaScriptUrls) {
    console.warn(`PlaceholderEmbed has blocked a javascript: URL as a security precaution`);
    return null;
  }

  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={[
        {
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#dee2e6',
          backgroundColor: '#ffffff',
          position: 'relative',
        },
        style,
      ]}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: imageUrl ? 'flex-start' : 'center' }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} />
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
    </Pressable>
  );
};
