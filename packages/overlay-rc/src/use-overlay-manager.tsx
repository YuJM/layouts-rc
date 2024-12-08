import {computed, signal} from '@preact/signals-react';
import {nanoid} from 'nanoid';
import type {OverlayData, OverlayOptions} from './types.ts';
import {awaitIfPromise} from './awaitIfPromise';

// 전역 Overlay 상태 관리 (useBeforeClose에서 사용하므로 export)
export const overlays = signal<OverlayData<any, any>[]>([]);

// 활성화된 Overlay 계산
const activeOverlays = computed(() =>
    overlays.value.filter((overlay) => overlay.open),
);

// Overlay 훅
export const useOverlayManager = () => {
  // Overlay 닫기 처리 함수
  const closeOverlay = <TResult,>(
      id: string,
      resolve: (value: TResult | undefined) => void, // 타입 명시
      result?: TResult,
) => {
    const overlayIndex = overlays.value.findIndex((o) => o.id === id);
    if (overlayIndex > -1) {
      const overlay = overlays.value[overlayIndex];

      // overlays 배열을 직접 수정하지 않고, 새로운 배열을 생성하여 업데이트
      overlays.value = [
        ...overlays.value.slice(0, overlayIndex),
        ...overlays.value.slice(overlayIndex + 1),
      ];

      resolve(result); // close 함수 호출 시 resolve 호출
      overlay?.onClose?.(result);
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
        const existingOverlayIndex = overlays.value.findIndex((o) => o.id === id);

        if (existingOverlayIndex > -1) {
          const existingOverlay = overlays.value[existingOverlayIndex];
          const canClose = await awaitIfPromise<boolean>(
              existingOverlay.beforeClose ? existingOverlay.beforeClose() : true,
          );

          if (!canClose) {
            resolve(undefined); // 닫기 취소 시 undefined 반환
            return; // 닫기 취소 및 새 Overlay 열기 취소
          }

          // 기존 Overlay 닫기 (overlays 배열 업데이트 포함)
          closeOverlay(id, resolve);
          return;
        }
      };

      // 새 Overlay 생성 및 overlays 배열에 추가
      const createNewOverlay = () => {
        const newOverlay: OverlayData<TData, TResult> = {
          ...options,
          id,
          open: true,
          onClose: (result) => {
            closeOverlay(id, resolve, result);
          },
        };

        overlays.value = [...overlays.value, newOverlay];

        options.onOpen?.(id); // onOpen 콜백 호출
      };

      // handleExistingOverlay는 async 함수이므로 Promise를 반환합니다.
      // handleExistingOverlay가 완료된 후에 createNewOverlay를 실행해야 합니다.
      handleExistingOverlay().then(createNewOverlay);
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

      // closeOverlay 함수를 사용하여 overlays 배열 업데이트 및 onClose 호출
      // resolve는 필요 없으므로 빈 함수 전달
      closeOverlay(id, () => {});
    }
  };

  return { openOverlay, closeAllOverlays, closeOverlayById, overlays: activeOverlays };
};
