import { Image, Linking, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { toNativeSize } from '../utils/style';
import type {
  BoxProps,
  IFrameProps,
  ImageProps,
  LinkProps,
  StyleTagProps,
  TextProps,
} from './types';

export type {
  BoxProps,
  IFrameProps,
  ImageProps,
  LinkProps,
  StyleTagProps,
  TextProps,
} from './types';

export const Box = ({ id, style, children, testID, nativeID }: BoxProps) => (
  <View nativeID={nativeID ?? id} testID={testID} style={style}>
    {children}
  </View>
);

export const Txt = ({ style, children, numberOfLines }: TextProps) => (
  <Text style={style} numberOfLines={numberOfLines}>
    {children}
  </Text>
);

export const EmbedLink = ({ href, style, children }: LinkProps) => (
  <Text style={[{ color: '#0095f6' }, style]} onPress={() => Linking.openURL(href)}>
    {children}
  </Text>
);

export const EmbedImage = ({ src, style }: ImageProps) => (
  <Image source={{ uri: src }} style={[{ width: '100%', height: '100%' }, style]} />
);

export const IFrame = ({ src, srcDoc, width, height, style, onLoad, onError }: IFrameProps) => (
  <WebView
    source={srcDoc ? { html: srcDoc } : { uri: src ?? '' }}
    onLoad={onLoad}
    onError={onError}
    originWhitelist={['*']}
    javaScriptEnabled
    domStorageEnabled
    startInLoadingState
    mixedContentMode="always"
    setSupportMultipleWindows={false}
    style={[
      {
        width: typeof width === 'number' ? width : '100%',
        height: toNativeSize(height, 500),
        backgroundColor: 'transparent',
      },
      style,
    ]}
  />
);

export const StyleTag = (_props: StyleTagProps) => null;
