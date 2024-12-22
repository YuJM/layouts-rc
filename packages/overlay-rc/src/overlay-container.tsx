import { useSignals } from '@preact/signals-react/runtime';
import { useEffect } from 'react';
import { useOverlayManager } from './use-overlay-manager.tsx';

const CLEANUP_INTERVAL = 30000; // 30초
const CLEANUP_THRESHOLD = 10000; // 10초

export function OverlayContainer({ debug = false }: { debug?: boolean }) {
  useSignals();
  const { overlays: activeOverlays } = useOverlayManager();

  useEffect(() => {
    const cleanupOverlays = () => {
      const beforeCount = activeOverlays.value.length;
      const currentTime = Date.now();

      activeOverlays.value = activeOverlays.value.filter((overlay) => {
        if (overlay.open || !overlay.closeTimestamp) {
          return true;
        }
        return currentTime - overlay.closeTimestamp < CLEANUP_THRESHOLD;
      });

      const afterCount = activeOverlays.value.length;
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
  }, []);

  return (
    <>
      {activeOverlays.value.map((overlay) => (
        <overlay.content
          close={(result) => overlay.onClose?.(result)}
          data={overlay.data}
          key={overlay.id}
          id={overlay.id}
          open={overlay.open}
        />
      ))}
    </>
  );
}
