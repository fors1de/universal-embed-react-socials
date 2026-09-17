import type { CSSProperties, ReactNode, Ref } from 'react';

export interface BoxProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  testID?: string;
  nativeID?: string;
  [key: string]: unknown;
}

export interface TextProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  numberOfLines?: number;
}

export interface LinkProps {
  href: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

export interface ImageProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

export interface IFrameProps {
  src?: string;
  srcDoc?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  allow?: string;
  allowFullScreen?: boolean;
  title?: string;
  iframeRef?: Ref<unknown>;
  sandbox?: string;
}

export interface StyleTagProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
