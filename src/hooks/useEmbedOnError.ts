import { useCallback, useRef } from 'react';
import type { EmbedError, EmbedErrorReason } from '../types';

/** Stable reporter: latest `onError`, one event per url until the url changes. */
export const useEmbedOnError = (
  onError: ((error: EmbedError) => void) | undefined,
  url: string,
) => {
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const urlRef = useRef(url);
  const firedRef = useRef(false);
  if (urlRef.current !== url) {
    urlRef.current = url;
    firedRef.current = false;
  }
  return useCallback((reason: EmbedErrorReason) => {
    if (firedRef.current) {
      return;
    }
    firedRef.current = true;
    onErrorRef.current?.({ url: urlRef.current, reason });
  }, []);
};
