import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Box } from '../../host';
import { placeholderOverlayStyle } from '../../utils/style';

const focusRestoreTarget = (overlay: HTMLElement): HTMLElement | null => {
  const root = overlay.parentElement;
  if (!root) {
    return null;
  }
  const iframe = Array.from(root.querySelectorAll('iframe')).find((node) => !overlay.contains(node));
  if (iframe instanceof HTMLElement) {
    return iframe;
  }
  return root;
};

const restoreFocusFromOverlay = (overlay: HTMLElement) => {
  const active = document.activeElement;
  if (!(active instanceof Node) || !overlay.contains(active)) {
    return;
  }
  const target = focusRestoreTarget(overlay);
  if (!target) {
    return;
  }
  if (target.tagName !== 'IFRAME' && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
};

export const PlaceholderOverlay = ({
  show,
  children,
}: {
  show: boolean;
  children?: ReactNode;
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(show && children != null);

  useLayoutEffect(() => {
    if (show && children != null) {
      setMounted(true);
      return;
    }
    if (!mounted) {
      return;
    }
    const overlay = overlayRef.current;
    if (overlay) {
      restoreFocusFromOverlay(overlay);
    }
    setMounted(false);
  }, [show, children, mounted]);

  if (!mounted || children == null) {
    return null;
  }

  return (
    <div ref={overlayRef} style={placeholderOverlayStyle}>
      {children}
    </div>
  );
};

export const MediaFrame = ({
  children,
  placeholder,
  showPlaceholder,
}: {
  children: ReactNode;
  placeholder?: ReactNode;
  showPlaceholder: boolean;
}) => (
  <Box
    aria-busy={showPlaceholder || undefined}
    style={{ position: 'relative', width: '100%', height: '100%' }}
  >
    {children}
    <PlaceholderOverlay show={showPlaceholder && placeholder != null}>{placeholder}</PlaceholderOverlay>
  </Box>
);
