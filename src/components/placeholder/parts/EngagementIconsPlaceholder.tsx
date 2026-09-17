import type { CSSProperties } from 'react';
import { Box } from '../../../host';

export interface EngagementIconsPlaceholderProps {
  className?: string;
  style?: CSSProperties;
}

export const EngagementIconsPlaceholder = ({ className, style }: EngagementIconsPlaceholderProps) => (
  <Box aria-hidden="true" className={className} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 14, ...style }}>
    <Box style={{ backgroundColor: '#F4F4F4', borderRadius: 10, width: 20, height: 20 }} />
    <Box style={{ backgroundColor: '#F4F4F4', borderRadius: 10, width: 20, height: 20 }} />
    <Box style={{ backgroundColor: '#F4F4F4', borderRadius: 4, width: 20, height: 20 }} />
  </Box>
);
