import type { FrameDocument } from '../types';

export const ensureScript = (doc: FrameDocument, id: string, src: string): unknown => {
  const existing = doc.getElementById(id);
  if (existing) {
    return existing;
  }
  const script = doc.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  doc.head.appendChild(script);
  return script;
};
