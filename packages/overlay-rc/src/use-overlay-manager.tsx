import { computed, signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { nanoid } from 'nanoid';
import type { FC, ReactNode } from 'react';
import type { OverlayData, OverlayOptions } from './types.ts';

// 전역 Overlay 상태 관리
const overlays = signal<OverlayData<any, any>[]>([]);

// 활성화된 Overlay 계산
const activeOverlays = computed(() =>
  overlays.value.filter((overlay) => overlay.open),
);

// Overlay 훅
export const useOverlayManager = () => {
  // Overlay 열기 함수
  const openOverlay = <TData, TResult>(
    options: OverlayOptions<TData, TResult>,
  ) => {
    const id = options.id ?? nanoid();
    const newOverlay: OverlayData<TData, TResult> = {
      ...options,
      id,
      open: true,
      onClose: (result) => {
        options.onClose?.(result);
        overlays.value = overlays.value.filter((o) => o.id !== id);
      },
    };
    overlays.value = [...overlays.value, newOverlay];
  };

  // 모든 Overlay 닫기 함수
  const closeAllOverlays = () => (overlays.value = []);

  return { openOverlay, closeAllOverlays, overlays: activeOverlays };
};

// Overlay 컨테이너 컴포넌트
export const OverlayContainer: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  useSignals();
  const { overlays: activeOverlays } = useOverlayManager();

  return (
    <>
      {children}
      {activeOverlays.value.map((overlay) => (
        <overlay.content
          close={(result) => overlay.onClose?.(result)}
          data={overlay.data}
          key={overlay.id}
          open={overlay.open}
        />
      ))}
    </>
  );
};
