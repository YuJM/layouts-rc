import { useEffect } from 'react';
import { useOverlayManager } from './use-overlay-manager.tsx';
import { overlayStore } from './overlay-store';

const CLEANUP_INTERVAL = 30000; // 30초
const CLEANUP_THRESHOLD = 10000; // 10초

export function OverlayContainer({ debug = false }: { debug?: boolean }) {
  const { overlays } = useOverlayManager();

  useEffect(() => {
    const cleanupOverlays = () => {
      const currentOverlays = overlayStore.getOverlays();
      const beforeCount = currentOverlays.length;
      const currentTime = Date.now();

      const filteredOverlays = currentOverlays.filter((overlay) => {
        if (overlay.open || !overlay.closeTimestamp) {
          return true;
        }
        return currentTime - overlay.closeTimestamp < CLEANUP_THRESHOLD;
      });

      overlayStore.setOverlays(filteredOverlays);

      const afterCount = filteredOverlays.length;
      if (debug) {
        console.log(
          `Overlay cleanup: ${beforeCount - afterCount} overlays removed. ` +
            `(${afterCount} remaining)`,
        );
      }
    };

    const cleanupInterval = setInterval(cleanupOverlays, CLEANUP_INTERVAL);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [debug]);

  return (
    <>
      {overlays.map((overlay) => (
        <overlay.content
          close={(result) => overlay.onClose?.(result)}
          data={overlay.data}
          id={overlay.id}
          key={overlay.id}
          open={overlay.open}
        />
      ))}
    </>
  );
}
