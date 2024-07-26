// overlay-manager.ts
import { inject, markRaw, provide, ref, Ref, shallowRef } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import type {
  CloseEventDetail,
  ContentRenderData,
  OverlayCloseType,
  OverlayContentComponent,
  OverlayContextOption,
  OverlayOpenOption,
  OverlayRegisterReturn,
} from './types';
import { OVERLAY_CLOSE_EVENT_NAME, OVERLAY_TOGGLE_STATE } from './types';

const emptyFunc: VoidFunction = () => {};

export const OverlayManagerKey = Symbol('OverlayManager');

export function useOverlayRegister<T, R>(): OverlayRegisterReturn<T, R> {
  const overlays = shallowRef<ContentRenderData<T, R>[]>([]);

  useIntervalFn(() => {
    // Remove component state of close every 30 seconds.
    overlays.value = overlays.value.filter(
      renderData => renderData.state === OVERLAY_TOGGLE_STATE.OPEN,
    );
  }, 30 * 1000);

  const closeHandler = (id: string, isEvent = false) => ({
    apply: async (target: OverlayCloseType<R>, thisArg: any, args: any[]) => {
      if (isEvent) {
        const customEvent = new CustomEvent(OVERLAY_CLOSE_EVENT_NAME, {
          detail: { targetId: id, args } as CloseEventDetail,
        });
        window.dispatchEvent(customEvent);
      }
      await Reflect.apply(target, thisArg, args);
      overlays.value = overlays.value.map(renderData => {
        if (renderData.id === id) {
          renderData.state = OVERLAY_TOGGLE_STATE.CLOSE;
        }
        return renderData;
      });
    },
  });

  const overlayOpen = (option: OverlayOpenOption<T, R>) => {
    const id = (() => `overlay:${Date.now()}`)();

    const proxyClose: OverlayCloseType<R> = new Proxy(
      option.close ?? emptyFunc,
      closeHandler(id, !option.close),
    );
    const renderData: ContentRenderData<T, R> = {
      ...option,
      content: markRaw(option.content),
      id,
      state: OVERLAY_TOGGLE_STATE.OPEN,
      close: proxyClose,
      data: option.data,
    };

    overlays.value = [...overlays.value, renderData];
    return id;
  };

  const closeAllOverlay: VoidFunction = () => {
    overlays.value = [];
  };

  // provide(OverlayManagerKey, { overlayOpen, closeAllOverlay });

  return { overlays, overlayOpen, closeAllOverlay };
}

export function useOverlayManager() {
  return inject(OverlayManagerKey) as OverlayContextOption;
}

export function useOverlayStateful<DATA = any, RESULT = any>(
  content: OverlayContentComponent<DATA>,
  closeFn?: OverlayCloseType<RESULT>,
) {
  const { overlayOpen } = useOverlayManager();
  const id = ref<string | undefined>();

  window.addEventListener(OVERLAY_CLOSE_EVENT_NAME, event => {
    if (id.value) {
      const { targetId, args } = (event as CustomEvent).detail;
      if (targetId === id.value) closeFn?.(...args);
    }
  });

  function openModal(data?: DATA) {
    id.value = overlayOpen({ content, data, kind: 'modal' });
  }

  return [openModal] as const;
}
