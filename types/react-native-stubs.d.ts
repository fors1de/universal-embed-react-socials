declare module 'react-native' {
  import type { ComponentType, ReactNode } from 'react';

  export type StyleProp<T> = T | T[] | null | undefined | false;
  export type ViewStyle = object;
  export type TextStyle = object;
  export type ImageStyle = object;

  export interface View {
    measureInWindow: (
      callback: (x: number, y: number, width: number, height: number) => void,
    ) => void;
  }

  export const View: ComponentType<Record<string, unknown> & { children?: ReactNode }>;
  export const Text: ComponentType<Record<string, unknown> & { children?: ReactNode }>;
  export const Image: ComponentType<Record<string, unknown>>;
  export const Pressable: ComponentType<Record<string, unknown> & { children?: ReactNode }>;
  export const ActivityIndicator: ComponentType<Record<string, unknown>>;

  export const Linking: {
    openURL: (url: string) => Promise<void>;
  };

  export const AccessibilityInfo: {
    isReduceMotionEnabled: () => Promise<boolean>;
    addEventListener: (
      event: 'reduceMotionChanged',
      handler: (reduceMotionEnabled: boolean) => void,
    ) => { remove: () => void };
  };

  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
    addEventListener: (
      event: 'change',
      handler: (dims: {
        window: { width: number; height: number };
        screen: { width: number; height: number };
      }) => void,
    ) => { remove: () => void };
  };

  export const Platform: { OS: string };

  export const NativeModules: {
    I18nManager?: { localeIdentifier?: string };
    SettingsManager?: {
      settings?: { AppleLocale?: string; AppleLanguages?: string[] };
    };
  };
}

declare module 'react-native-webview' {
  import type { ComponentType, ReactNode } from 'react';

  export interface WebView {
    reload: () => void;
  }

  export const WebView: ComponentType<Record<string, unknown> & { children?: ReactNode }>;
}
