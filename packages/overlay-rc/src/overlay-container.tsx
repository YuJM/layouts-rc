import { useEffect } from 'react';
import { useOverlayManager } from './use-overlay-manager';
import { overlayStore } from './overlay-store';
import { OverlayProvider } from './overlay-context';

const CLEANUP_INTERVAL = 5000; // 5초
const CLEANUP_THRESHOLD = 1000; // 1초

export function OverlayContainer() {
  const { overlays } = useOverlayManager();

  useEffect(() => {
    const cleanupOverlays = () => {
      const currentOverlays = overlayStore.getOverlays();
      const currentTime = Date.now();

      const filteredOverlays = currentOverlays.filter((overlay) => {
        if (overlay.isOpen || !overlay.closeTimestamp) {
          return true;
        }
        return currentTime - overlay.closeTimestamp < CLEANUP_THRESHOLD;
      });

      overlayStore.setOverlays(filteredOverlays);
    };

    const cleanupInterval = setInterval(cleanupOverlays, CLEANUP_INTERVAL);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <>
      {overlays.map((overlay) => {
        // 각 overlay마다 고유한 context value 생성
        const contextValue = {
          overlayId: overlay.id,
          isOpen: overlay.isOpen,
          overlayData: overlay.data,
          closeOverlay: (result?: unknown) => overlay.onClose?.(result),
        };

        return (
          // 각 Content를 독립적인 Provider로 감쌈
          <OverlayProvider key={overlay.id} value={contextValue}>
            <overlay.content key={overlay.id} />
          </OverlayProvider>
        );
      })}
    </>
  );
}
