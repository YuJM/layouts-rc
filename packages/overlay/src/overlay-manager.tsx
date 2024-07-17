import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { useEvent, useInterval } from 'react-use';
import type {
  CloseEventDetail,
  ContentRenderData,
  OverlayCloseType,
  OverlayContentComponent,
  OverlayContextOption,
  OverlayOpenOption,
} from './types.ts';
import { OVERLAY_CLOSE_EVENT_NAME, OVERLAY_TOGGLE_STATE } from './types.ts';

type Args = any[];

const emptyFunc: () => void = () => {};

const OverlayManagerContext = createContext<OverlayContextOption>({
  closeAllOverlay: () => {},
});

function useOverlayManager() {
  return useContext(OverlayManagerContext);
}

function useOverlayRegister<T, R>() {
  const [overlays, setOverlays] = useState<ContentRenderData<T, R>[]>([]);

  useInterval(() => {
    // Remove component state of close every 30 seconds.
    setOverlays((prev) => {
      return prev.filter(
        (renderData) => renderData.state === OVERLAY_TOGGLE_STATE.OPEN,
      );
    });
  }, 30 * 1000);

  const closeHandler = (id: string, isEvent = false) => ({
    apply: async (target: OverlayCloseType<R>, thisArg: any, args: Args) => {
      if (isEvent) {
        const customEvent = new CustomEvent(OVERLAY_CLOSE_EVENT_NAME, {
          detail: { targetId: id, args } as CloseEventDetail,
        });
        window.dispatchEvent(customEvent);
      }
      await Reflect.apply(target, thisArg, args);
      setOverlays((prev) =>
        prev.map((renderData) => {
          if (renderData.id === id) {
            renderData.state = OVERLAY_TOGGLE_STATE.CLOSE;
          }
          return renderData;
        }),
      );
    },
  });

  const overlayOpen = (option: OverlayOpenOption<T, R>) => {
    const id = (() => `overlay:${Date.now()}`)();

    const proxyClose: OverlayCloseType<R> = new Proxy(
      option.close ?? emptyFunc,
      closeHandler(id, !option.close),
    );
    const renderData: ContentRenderData<T> = {
      ...option,
      id,
      state: OVERLAY_TOGGLE_STATE.OPEN,
      close: proxyClose,
      data: option.data as T,
    };

    setOverlays((prev) => {
      return [...prev, renderData];
    });
    return id;
  };

  const closeAllOverlay: VoidFunction = () => {
    setOverlays([]);
  };

  function OverlayProvider({ children }: { children: ReactNode }) {
    return (
      <OverlayManagerContext.Provider value={{ overlayOpen, closeAllOverlay }}>
        {children}
      </OverlayManagerContext.Provider>
    );
  }
  return { overlays, OverlayProvider } as const;
}

/**
 * modal close callback 이 stateful 하게 동작하도록 하는 hook
 * @param content
 * @param closeFn
 * @example
 * 기본 사용
 * const [openSomeModal] = useOverlayStateful(SomeModalContent, closeCallback);
 *
 * curring 으로 사용하기
 * const useHolidayModal = (close: OverlayCloseType) => {
 *   return useOverlayStateful(SomeModalContent, close);
 * };
 * export const InterviewModals = {
 *   useHolidayModal,
 * } as const;
 * @experimental
 */
function useOverlayStateful<DATA = any, RESULT = any>(
  content: OverlayContentComponent<DATA>,
  closeFn?: OverlayCloseType<RESULT>,
) {
  const { overlayOpen } = useContext(OverlayManagerContext);
  const [id, setId] = useState<string | undefined>();

  useEvent(OVERLAY_CLOSE_EVENT_NAME, (event) => {
    if (id) {
      const { targetId, args } = (event as CustomEvent).detail;
      if (targetId === id) closeFn?.(...args);
    }
  });

  function openModal(data?: DATA) {
    setId(overlayOpen?.({ content, data, kind: 'modal' }));
  }

  return [openModal] as const;
}

export {
  useOverlayRegister,
  useOverlayStateful,
  OverlayManagerContext,
  useOverlayManager,
};
