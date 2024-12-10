import { computed, signal } from '@preact/signals-react';
import { nanoid } from 'nanoid';
import type { OverlayData, OverlayOptions } from './types.ts';
import { awaitIfPromise } from './awaitIfPromise';

// 전역 Overlay 상태 관리 (useBeforeClose에서 사용하므로 export)
export const overlays = signal<OverlayData<any, any>[]>([]);

// 활성화된 Overlay 계산
const activeOverlays = computed(() =>
  overlays.value.filter((overlay) => overlay.open),
);

// Overlay 훅
export const useOverlayManager = () => {
  /* Overlay 닫기 처리 함수
  여기 함수에서는 option이 push 되지 않았기 때문에 
  */
  const closeOverlay = <TResult,>(
    id: string,
    resolve: (value: TResult | undefined) => void, // 타입 명시
    result?: TResult,
  ) => {
    const overlayIndex = overlays.value.findIndex((o) => o.id === id);
    if (overlayIndex > -1) {
      // overlays 배열을 직접 수정하지 않고, 새로운 배열을 생성하여 업데이트
      overlays.value = [
        ...overlays.value.slice(0, overlayIndex),
        ...overlays.value.slice(overlayIndex + 1),
      ];

      resolve(result); // close 함수 호출 시 resolve 호출
    } else {
      resolve(undefined); // Overlay가 없으면 undefined resolve
    }
  };

  // Overlay 열기 함수
  const openOverlay = <TData, TResult>(
    options: OverlayOptions<TData, TResult>,
  ): Promise<TResult | undefined> => {
    return new Promise((resolve) => {
      const id = options.id ?? nanoid();

      // 기존 Overlay 닫기 확인 (Promise 처리)
      const handleExistingOverlay = async () => {
        const existingOverlayIndex = overlays.value.findIndex(
          (o) => o.id === id,
        );

        if (existingOverlayIndex > -1) {
          const existingOverlay = overlays.value[existingOverlayIndex];
          const canClose = await awaitIfPromise<boolean>(
            existingOverlay.beforeClose ? existingOverlay.beforeClose() : true,
          );

          // 닫기가 취소된 경우
          if (!canClose) {
            resolve(undefined); // Promise를 undefined로 resolve
            return false; // 추가 작업 중단
          }

          // 기존 오버레이를 닫고 Promise resolve
          closeOverlay(id, resolve);
          void options.onClose?.(undefined);
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
            closeOverlay(id, resolve, result);
            void options.onClose?.(result);
          },
        };

        overlays.value = [...overlays.value, newOverlay];
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
  const closeAllOverlays = () => (overlays.value = []);

  // ID로 Overlay 닫기 함수
  const closeOverlayById = async (id: string) => {
    const overlay = overlays.value.find((o) => o.id === id);

    if (overlay) {
      const canClose = await awaitIfPromise<boolean>(
        overlay.beforeClose ? overlay.beforeClose() : true,
      );

      if (!canClose) {
        return; // 닫기 취소
      }

      closeOverlay(id, () => undefined);
      void overlay.onClose?.(undefined);
    }
  };

  return {
    openOverlay,
    closeAllOverlays,
    closeOverlayById,
    overlays: activeOverlays,
  };
};
