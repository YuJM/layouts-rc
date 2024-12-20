// export { useOverlay, OverlayContainer } from './overlay-manager';

export * from './use-overlay-manager.tsx';

export type {
  OverlayContentProps,
  OverlayContent,
  OverlayData,
  OverlayId,
  OverlayKind,
  OverlayOptions,
  OverlayPosition,
} from './types.ts';
export {OverlayContainer} from "./overlay-container.tsx";
export {useBeforeClose} from "./use-before-close.tsx";