import { useSyncExternalStore } from 'react';
import { nanoid } from 'nanoid';
import type { OverlayData, OverlayOptions } from './types.ts';
import { awaitIfPromise } from './awaitIfPromise';
import { overlayStore } from './overlay-store';

// Overlay 훅
export const useOverlayManager = () => {
  // useSyncExternalStore로 overlay 상태 구독
  const overlays = useSyncExternalStore(
    overlayStore.subscribe,
    overlayStore.getSnapshot,
    overlayStore.getServerSnapshot,
  );

  /* Overlay 닫기 처리 함수 */
  const closeOverlay = (id: string) => {
    const currentOverlays = overlayStore.getOverlays();
    const updatedOverlays = currentOverlays.map((overlay) => {
      if (id === overlay.id) {
        return {
          ...overlay,
          open: false,
          closeTimestamp: Date.now(),
        };
      }
      return overlay;
    });
    overlayStore.setOverlays(updatedOverlays);
  };

  // Overlay 열기 함수
  const openOverlay = <TData, TResult>(
    options: OverlayOptions<TData, TResult>,
  ): Promise<TResult | undefined> => {
    return new Promise((resolve) => {
      const id = options.id ?? nanoid();

      // 기존 Overlay 닫기 확인 (Promise 처리)
      const handleExistingOverlay = async () => {
        const currentOverlays = overlayStore.getOverlays();
        const existingOverlayIndex = currentOverlays.findIndex(
          (o) => o.id === id,
        );

        if (existingOverlayIndex > -1) {
          const existingOverlay = currentOverlays[existingOverlayIndex];
          const canClose = await awaitIfPromise<boolean>(
            existingOverlay.beforeClose ? existingOverlay.beforeClose() : true,
          );

          // 닫기가 취소된 경우
          if (!canClose) {
            return false; // 추가 작업 중단
          }

          // 기존 오버레이를 닫고 Promise resolve
          closeOverlay(id);
          void existingOverlay.onClose?.(undefined);
        }
        return true;
      };

      // 새 Overlay 생성 및 overlays 배열에 추가
      const createNewOverlay = () => {
        const newOverlay: OverlayData<TData, TResult> = {
          ...options,
          id,
          open: true,
          onClose: (result) => {
            closeOverlay(id);
            void options.onClose?.(result);
            resolve(result);
          },
        };

        const currentOverlays = overlayStore.getOverlays();
        overlayStore.setOverlays([...currentOverlays, newOverlay]);
        void options.onOpen?.(id);
      };

      void handleExistingOverlay().then((shouldContinue) => {
        if (shouldContinue) {
          createNewOverlay();
        }
      });
    });
  };

  // 모든 Overlay 닫기 함수
  const closeAllOverlays = () => { overlayStore.setOverlays([]); };

  // ID로 Overlay 닫기 함수
  const closeOverlayById = async (id: string) => {
    const currentOverlays = overlayStore.getOverlays();
    const overlay = currentOverlays.find((o) => o.id === id);

    if (overlay) {
      const canClose = await awaitIfPromise<boolean>(
        overlay.beforeClose ? overlay.beforeClose() : true,
      );

      if (!canClose) {
        return; // 닫기 취소
      }

      closeOverlay(id);
      void overlay.onClose?.(undefined);
    }
  };

  return {
    openOverlay,
    closeAllOverlays,
    closeOverlayById,
    overlays,
  } as const;
};
