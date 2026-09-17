import type { ReactElement } from 'react';
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
};

export declare const Box: (props: BoxProps) => ReactElement;
export declare const Txt: (props: TextProps) => ReactElement | null;
export declare const EmbedLink: (props: LinkProps) => ReactElement;
export declare const EmbedImage: (props: ImageProps) => ReactElement;
export declare const IFrame: (props: IFrameProps) => ReactElement;
export declare const StyleTag: (props: StyleTagProps) => ReactElement | null;
