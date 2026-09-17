import type { Ref } from 'react';
import type {
  BoxProps,
  IFrameProps,
  ImageProps,
  LinkProps,
  StyleTagProps,
  TextProps,
} from "./types";

export type {
  BoxProps,
  IFrameProps,
  ImageProps,
  LinkProps,
  StyleTagProps,
  TextProps,
} from "./types";

export const Box = ({
  id,
  className,
  style,
  children,
  testID,
  nativeID,
  ...rest
}: BoxProps) => (
  <div
    id={id ?? nativeID}
    className={className}
    style={style}
    data-testid={testID}
    {...rest}
  >
    {children}
  </div>
);

export const Txt = ({ className, style, children }: TextProps) => (
  <span className={className} style={style}>
    {children}
  </span>
);

export const EmbedLink = ({
  href,
  className,
  style,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
}: LinkProps) => (
  <a href={href} className={className} style={style} target={target} rel={rel}>
    {children}
  </a>
);

export const EmbedImage = ({ src, className, style, alt }: ImageProps) => (
  <img src={src} className={className} style={style} alt={alt} />
);

export const IFrame = ({
  src,
  srcDoc,
  width,
  height,
  className,
  style,
  onLoad,
  allow,
  allowFullScreen,
  title,
  iframeRef,
}: IFrameProps) => (
  <iframe
    ref={iframeRef as Ref<HTMLIFrameElement>}
    src={src}
    srcDoc={srcDoc}
    width={width}
    height={height}
    className={className}
    style={{ display: "block", border: 0, ...style }}
    onLoad={onLoad}
    allow={allow}
    allowFullScreen={allowFullScreen}
    title={title}
  />
);

export const StyleTag = ({ className, style, children }: StyleTagProps) => (
  <style className={className} style={style}>
    {children}
  </style>
);
