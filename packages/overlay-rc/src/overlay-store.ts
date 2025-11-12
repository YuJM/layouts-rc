import type { OverlayData } from './types';

/**
 * Overlay Store for managing overlay state with useSyncExternalStore
 *
 * This store follows React 18's useSyncExternalStore pattern:
 * - subscribe: Stable function reference (class method) to prevent resubscriptions
 * - getSnapshot: Returns immutable reference for efficient change detection
 * - getServerSnapshot: Provides SSR support with empty initial state
 *
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
class OverlayStore {
  private overlays: OverlayData<unknown, unknown>[] = [];
  private listeners = new Set<() => void>();

  /**
   * Subscribe to overlay changes
   *
   * ✅ Stable function reference - prevents unnecessary resubscriptions
   * Returns unsubscribe function for cleanup
   */
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Get current snapshot of overlays
   *
   * ✅ Returns immutable array reference - only changes when setOverlays() is called
   * React uses Object.is() to detect changes, ensuring efficient re-renders
   */
  getSnapshot = () => {
    return this.overlays;
  };

  /**
   * Get server snapshot (for SSR)
   *
   * ✅ Returns empty array for server-side rendering
   * Prevents hydration mismatches and ensures consistent initial state
   */
  getServerSnapshot = () => {
    return [];
  };

  /**
   * Update overlays and notify listeners
   */
  setOverlays = (newOverlays: OverlayData<unknown, unknown>[]) => {
    this.overlays = newOverlays;
    this.emitChange();
  };

  /**
   * Get current overlays without subscription
   */
  getOverlays = () => {
    return this.overlays;
  };

  /**
   * Notify all listeners of changes
   */
  private emitChange = () => {
    this.listeners.forEach((listener) => { listener(); });
  };
}

// Export singleton instance
export const overlayStore = new OverlayStore();
