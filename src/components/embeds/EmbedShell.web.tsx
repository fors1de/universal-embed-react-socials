import type { CSSProperties, ReactNode } from "react";
import type { EmbedStyle as EmbedStyleProp } from "../../types";
import { Box } from "../../host";
import { classNames } from "../../utils/classNames";
import { boxSizeStyle } from "../../utils/style";
import { EmbedStyle } from "./EmbedStyle";

export interface EmbedShellProps {
  className?: string;
  extraClassName?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: EmbedStyleProp;
  children?: ReactNode;
  id?: string;
  testID?: string;
}

export const EmbedShell = ({
  className,
  extraClassName,
  width,
  height,
  borderRadius,
  style,
  children,
  id,
  testID,
}: EmbedShellProps) => (
  <Box
    id={id}
    testID={testID}
    className={classNames("rsme-embed", extraClassName, className)}
    style={boxSizeStyle(width, height, { borderRadius, ...(style as CSSProperties) })}
  >
    <EmbedStyle />
    {children}
  </Box>
);
