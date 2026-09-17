import type { CSSProperties } from 'react';
import { Box } from '../../../host';

export interface ProfilePlaceholderProps {
  className?: string;
  style?: CSSProperties;
}

export const ProfilePlaceholder = ({ className, style }: ProfilePlaceholderProps) => (
  <Box aria-hidden="true" className={className} style={style}>
    <Box style={{ display: 'flex', flexDirection: 'row', columnGap: 14 }}>
      <Box
        style={{
          backgroundColor: '#F4F4F4',
          borderRadius: 20,
          width: 40,
          height: 40,
        }}
      />
      <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', rowGap: 6 }}>
        <Box
          style={{
            backgroundColor: '#F4F4F4',
            borderRadius: 4,
            width: 100,
            height: 14,
          }}
        />
        <Box
          style={{
            backgroundColor: '#F4F4F4',
            borderRadius: 4,
            width: 60,
            height: 14,
          }}
        />
      </Box>
    </Box>
  </Box>
);
