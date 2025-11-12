import { useEffect } from 'react';
import { overlayStore } from './overlay-store';

/**
 * When the manager tries to run an overlay with the same id
 * Function that executes before closing the overlay
 * @param beforeClose - Function to execute before closing overlay
 * @param id - Overlay identifier
 */
export const useBeforeClose = (
  beforeClose: () => Promise<boolean> | boolean,
  id: string,
) => {
  useEffect(() => {
    // id가 없으면 그냥 무시
    if (!id) return;

    // 해당 id를 가진 Overlay의 beforeClose를 설정
    const currentOverlays = overlayStore.getOverlays();
    const updatedOverlays = currentOverlays.map((o) =>
      o.id === id ? { ...o, beforeClose } : o,
    );
    overlayStore.setOverlays(updatedOverlays);

    // unmount시
    return () => {
      // id가 없으면 그냥 무시
      if (!id) return;

      // 해당 id를 가진 Overlay의 beforeClose를 제거
      const cleanupOverlays = overlayStore.getOverlays();
      const cleanupUpdated = cleanupOverlays.map((o) =>
        o.id === id ? { ...o, beforeClose: undefined } : o,
      );
      overlayStore.setOverlays(cleanupUpdated);
    };
  }, [beforeClose, id]);
};
