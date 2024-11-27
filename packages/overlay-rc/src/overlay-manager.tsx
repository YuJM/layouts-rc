import { computed, signal } from '@preact/signals-react';
import type { CSSProperties, FC } from 'react';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type {
  CloseEventDetail,
  OverlayId,
  OverlayKind,
  OverlayOpenOptions,
  OverlayPosition,
  OverlayRenderData,
} from './types';
import { OVERLAY_EVENTS } from './constants.ts';

const overlaysSignal = signal<Map<OverlayId, OverlayRenderData<any, any>>>(
  new Map(),
);
const defaultPosition: OverlayPosition = 'center';
const defaultKind: OverlayKind = 'overlay';

const activeOverlays = computed(() => {
  return Array.from(overlaysSignal.value.values())
    .filter(
      (overlay): overlay is OverlayRenderData & { state: true } =>
        overlay.state,
    )
    .sort((a, b) => (a.id > b.id ? 1 : -1));
});

function dispatchOverlayEvent<TResult>(
  eventName: (typeof OVERLAY_EVENTS)[keyof typeof OVERLAY_EVENTS],
  detail: CloseEventDetail<TResult>,
): void {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function createCloseFunction<TResult>(
  id: OverlayId,
  options?: { close?: (result?: TResult) => void | Promise<void> },
) {
  const closeSignal = computed(() => {
    return async (result?: TResult) => {
      const overlay = overlaysSignal.value.get(id);
      if (!overlay) return;

      dispatchOverlayEvent(OVERLAY_EVENTS.BEFORE_CLOSE, {
        overlayId: id,
        args: result ? [result] : [],
      });

      if (options?.close) {
        await options.close(result);
      }

      overlaysSignal.value = new Map(overlaysSignal.value).set(id, {
        ...overlay,
        state: false,
      });

      dispatchOverlayEvent(OVERLAY_EVENTS.CLOSE, {
        overlayId: id,
        args: result ? [result] : [],
      });
    };
  });

  return closeSignal;
}

export const useOverlay = () => {
  const open = useCallback(
    <TData = unknown, TResult = unknown>(
      options: OverlayOpenOptions<TData, TResult>,
    ): OverlayId => {
      const id = nanoid();
      const closeFn = createCloseFunction<TResult>(id, options);

      const proxyData = new Proxy((options.data as object) ?? {}, {
        get(target, prop) {
          if (prop === 'close') {
            return closeFn.value;
          }
          return Reflect.get(target, prop);
        },
      });

      const overlayData: OverlayRenderData<TData, TResult> = {
        id,
        state: true,
        content: options.content,
        position: options.position ?? defaultPosition,
        kind: options.kind ?? defaultKind,
        overlayHidden: options.overlayHidden ?? false,
        title: options.title ?? null,
        width: options.width,
        height: options.height,
        style: options.style,
        className: options.className,
        data: proxyData as TData,
        close: closeFn.value,
      };

      overlaysSignal.value = new Map(overlaysSignal.value);
      overlaysSignal.value.set(id, overlayData);
      return id;
    },
    [],
  );

  const close = useCallback(
    <TResult = void,>(id: OverlayId, result?: TResult): void => {
      const overlay = overlaysSignal.value.get(id);
      if (overlay) {
        overlay.close?.(result as void);
      }
    },
    [],
  );

  const closeAll = useCallback((): void => {
    overlaysSignal.value = new Map();
  }, []);

  return {
    open,
    close,
    closeAll,
    overlays: activeOverlays,
  };
};

interface OverlayContainerProps {
  className?: string;
  style?: CSSProperties;
}

export const OverlayContainer: FC<OverlayContainerProps> = ({
  className,
  style,
}) => {
  const { overlays } = useOverlay();

  return (
    <div className={className} style={style}>
      {overlays.value.map((overlay) => {
        const Content = overlay.content;
        return (
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
            <Content
              close={overlay.close as (result?: any) => void}
              data={overlay.data}
              id={overlay.id}
              open={overlay.state}
            />
          </div>
        );
      })}
    </div>
  );
};
