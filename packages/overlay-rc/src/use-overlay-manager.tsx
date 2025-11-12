import { useSyncExternalStore, useId, useRef } from 'react';
import type { OverlayData, OverlayOptions } from './types';
import { safeAwaitIfPromise } from './await-if-promise';
import { overlayStore } from './overlay-store';

// Overlay 훅
export const useOverlayManager = () => {
  // React 18 useId로 SSR-safe한 고유 ID 생성
  const baseId = useId();
  const counterRef = useRef(0);

  // useSyncExternalStore로 overlay 상태 구독
  const overlays = useSyncExternalStore(
    overlayStore.subscribe,
    overlayStore.getSnapshot,
    overlayStore.getServerSnapshot,
  );

  /* Overlay 닫기 처리 함수 (내부 헬퍼) */
  const markOverlayAsClosed = (id: string) => {
    const currentOverlays = overlayStore.getOverlays();
    const updatedOverlays = currentOverlays.map((overlay) => {
      if (id === overlay.id) {
        return {
          ...overlay,
          isOpen: false,
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
      // React 18 useId + counter로 고유 ID 생성 (SSR-safe)
      const id = options.id ?? `${baseId}-overlay-${counterRef.current++}`;

      // 기존 Overlay 닫기 확인 (Promise 처리)
      const handleExistingOverlay = async () => {
        const currentOverlays = overlayStore.getOverlays();
        const existingOverlayIndex = currentOverlays.findIndex(
          (o) => o.id === id,
        );

        if (existingOverlayIndex > -1) {
          const existingOverlay = currentOverlays[existingOverlayIndex];
          const canClose = await safeAwaitIfPromise<boolean>(
            existingOverlay.beforeClose ? existingOverlay.beforeClose() : true,
            true,
            (error) => console.error('[Overlay] beforeClose error:', error)
          );

          // 닫기가 취소된 경우
          if (!canClose) {
            return false; // 추가 작업 중단
          }

          // 기존 오버레이를 닫고 Promise resolve
          markOverlayAsClosed(id);
          try {
            await existingOverlay.onClose?.(undefined);
          } catch (error) {
            console.error('[Overlay] onClose error:', error);
          }
        }
        return true;
      };

      // 새 Overlay 생성 및 overlays 배열에 추가
      const createNewOverlay = () => {
        const newOverlay: OverlayData<TData, TResult> = {
          ...options,
          id,
          isOpen: true,
          onClose: async (result) => {
            markOverlayAsClosed(id);
            try {
              await options.onClose?.(result);
            } catch (error) {
              console.error('[Overlay] onClose error:', error);
            }
            resolve(result);
          },
        };

        const currentOverlays = overlayStore.getOverlays();
        overlayStore.setOverlays([...currentOverlays, newOverlay] as OverlayData<unknown, unknown>[]);
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
  const closeOverlay = async (id: string) => {
    const currentOverlays = overlayStore.getOverlays();
    const overlay = currentOverlays.find((o) => o.id === id);

    if (overlay) {
      const canClose = await safeAwaitIfPromise<boolean>(
        overlay.beforeClose ? overlay.beforeClose() : true,
        true,
        (error) => console.error('[Overlay] beforeClose error:', error)
      );

      if (!canClose) {
        return; // 닫기 취소
      }

      markOverlayAsClosed(id);
      try {
        await overlay.onClose?.(undefined);
      } catch (error) {
        console.error('[Overlay] onClose error:', error);
      }
    }
  };

  return {
    openOverlay,
    closeOverlay,
    closeAllOverlays,
    overlays,
  } as const;
};
