import type { OverlayData } from './types.ts';

/**
 * Overlay Store for managing overlay state with useSyncExternalStore
 */
class OverlayStore {
  private overlays: OverlayData<any, any>[] = [];
  private listeners = new Set<() => void>();

  /**
   * Subscribe to overlay changes
   */
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Get current snapshot of overlays
   */
  getSnapshot = () => {
    return this.overlays;
  };

  /**
   * Get server snapshot (for SSR)
   */
  getServerSnapshot = () => {
    return [];
  };

  /**
   * Update overlays and notify listeners
   */
  setOverlays = (newOverlays: OverlayData<any, any>[]) => {
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
