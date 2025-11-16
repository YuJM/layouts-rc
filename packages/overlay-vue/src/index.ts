/**
 * overlay-vue - Vue 3 Overlay Management Library
 */

// Components
export { default as OverlayHost } from './components/OverlayHost.vue';

// Composables
export { useOverlay } from './composables/use-overlay';
export type { UseOverlayReturn } from './composables/use-overlay';

export { useOverlayController } from './composables/use-overlay-controller';
export type { UseOverlayControllerReturn } from './composables/use-overlay-controller';

export { useCurrentOverlay } from './composables/use-current-overlay';
export type { CurrentOverlay } from './composables/use-current-overlay';

// Core Types
export type {
  OverlayState,
  OverlayOptions,
  OverlayController,
  OverlayResult,
  OverlayError,
} from './core/types';

export { OverlayManager } from './core/overlay-manager';
