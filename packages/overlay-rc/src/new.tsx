import { computed, signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { nanoid } from 'nanoid';
import type { CSSProperties, FC, ReactNode } from 'react';

// Overlay 타입 정의
interface OverlayOptions<TData, TResult> {
  id?: string;
  content: FC<{
    close: (result?: TResult) => void;
    data: TData;
    open: boolean;
  }>;
  data?: TData;
  position?: OverlayPosition;
  kind?: OverlayKind;
  title?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  className?: string;
  onClose?: (result?: TResult) => void | Promise<void>;
}

type OverlayId = string;
type OverlayPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
type OverlayKind = 'overlay' | 'modal' | 'drawer';

// Overlay 데이터 타입 정의
interface OverlayData<TData, TResult> extends OverlayOptions<TData, TResult> {
  id: OverlayId;
  open: boolean;
}

// 전역 Overlay 상태 관리
const overlays = signal<OverlayData<any, any>[]>([]);

// 활성화된 Overlay 계산
const activeOverlays = computed(() =>
  overlays.value.filter((overlay) => overlay.open),
);

// Overlay 훅
export const useOverlay = () => {
  // Overlay 열기 함수
  const open = <TData, TResult>(options: OverlayOptions<TData, TResult>) => {
    const id = options.id ?? nanoid();
    const newOverlay: OverlayData<TData, TResult> = {
      ...options,
      id,
      open: true,
    };
    overlays.value = [...overlays.value, newOverlay];
    return {
      close: (result?: TResult) => {
        close(id, result);
      },
    };
  };

  // Overlay 닫기 함수
  const close = <TResult = void,>(id: OverlayId, result?: TResult) => {
    const overlay = overlays.value.find((o) => o.id === id);
    if (overlay) {
      overlay.onClose?.(result);
      overlays.value = overlays.value.filter((o) => o.id !== id);
    }
  };

  // 모든 Overlay 닫기 함수
  const closeAll = () => (overlays.value = []);

  return { open, close, closeAll, overlays: activeOverlays };
};

// Overlay 컨테이너 컴포넌트
export const OverlayContainer: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  useSignals();
  const { overlays: activeOverlays } = useOverlay();

  return (
    <>
      {children}
      {activeOverlays.value.map((overlay) => (
        <div
          className={`overlay-container ${overlay.position} ${overlay.kind} ${overlay.className ?? ''}`}
          key={overlay.id}
          style={{
            ...overlay.style,
            width: overlay.width,
            height: overlay.height,
          }}
        >
          {overlay.title ? (
            <div className="overlay-title">{overlay.title}</div>
          ) : null}
          <overlay.content
            close={(result) => overlay.onClose?.(result)}
            data={overlay.data}
            open={overlay.open}
          />
        </div>
      ))}
    </>
  );
};
