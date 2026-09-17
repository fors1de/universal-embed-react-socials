import type { CSSProperties } from 'react';
import { Box, StyleTag } from '../../../host';
import { classNames } from '../../../utils/classNames';

export interface BorderSpinnerProps {
  className?: string;
  style?: CSSProperties;
}

export const BorderSpinner = ({ className, style }: BorderSpinnerProps) => (
  <Box role="status" aria-live="polite" aria-label="Loading">
    <StyleTag>
      {`
        .rsme-spinner {
          border: 3px solid rgba(0,0,0,0.75);
          border-right-color: transparent;
          border-radius: 50%;
          animation: rsme-spin 1s linear infinite;
        }
        @keyframes rsme-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rsme-spinner {
            animation: none;
            border-right-color: rgba(0,0,0,0.75);
          }
        }
      `}
    </StyleTag>
    <Box
      aria-hidden="true"
      className={classNames('rsme-spinner', className)}
      style={{ width: 10, height: 10, minWidth: 10, minHeight: 10, flexShrink: 0, boxSizing: 'border-box', ...style }}
    />
  </Box>
);
