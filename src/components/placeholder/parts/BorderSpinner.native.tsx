import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { AccessibilityInfo, ActivityIndicator, View } from 'react-native';

export interface BorderSpinnerProps {
  className?: string;
  style?: CSSProperties;
}

export const BorderSpinner = ({ style }: BorderSpinnerProps) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) {
        setReduceMotion(value);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  if (reduceMotion) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
        style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.75)' }, style]}
      />
    );
  }

  return (
    <ActivityIndicator
      size="small"
      color="#000000"
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    />
  );
};
