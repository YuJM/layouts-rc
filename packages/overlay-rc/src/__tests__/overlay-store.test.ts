import { describe, it, expect, beforeEach, vi } from 'vitest';
import { overlayStore } from '../overlay-store';
import type { OverlayData } from '../types';

describe('OverlayStore', () => {
  beforeEach(() => {
    // Reset store before each test
    overlayStore.setOverlays([]);
  });

  describe('subscribe', () => {
    it('should call listener when overlays change', () => {
      const listener = vi.fn();
      const unsubscribe = overlayStore.subscribe(listener);

      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should not call listener after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = overlayStore.subscribe(listener);

      unsubscribe();

      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = overlayStore.subscribe(listener1);
      const unsubscribe2 = overlayStore.subscribe(listener2);

      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('getSnapshot', () => {
    it('should return current overlays', () => {
      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      const snapshot = overlayStore.getSnapshot();

      expect(snapshot).toEqual([testOverlay]);
    });

    it('should return same reference if overlays not changed', () => {
      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      const snapshot1 = overlayStore.getSnapshot();
      const snapshot2 = overlayStore.getSnapshot();

      expect(snapshot1).toBe(snapshot2);
    });

    it('should return different reference when overlays changed', () => {
      const testOverlay1: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test1',
        onClose: vi.fn(),
      };

      const testOverlay2: OverlayData = {
        id: 'test-2',
        content: () => null,
        isOpen: true,
        data: 'test2',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay1]);
      const snapshot1 = overlayStore.getSnapshot();

      overlayStore.setOverlays([testOverlay2]);
      const snapshot2 = overlayStore.getSnapshot();

      expect(snapshot1).not.toBe(snapshot2);
    });
  });

  describe('getServerSnapshot', () => {
    it('should always return empty array', () => {
      const serverSnapshot = overlayStore.getServerSnapshot();

      expect(serverSnapshot).toEqual([]);
      expect(serverSnapshot).toHaveLength(0);
    });

    it('should return new array instance each time', () => {
      const snapshot1 = overlayStore.getServerSnapshot();
      const snapshot2 = overlayStore.getServerSnapshot();

      expect(snapshot1).not.toBe(snapshot2);
      expect(snapshot1).toEqual(snapshot2);
    });
  });

  describe('setOverlays', () => {
    it('should update overlays state', () => {
      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(overlayStore.getSnapshot()).toEqual([testOverlay]);
    });

    it('should notify all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      overlayStore.subscribe(listener1);
      overlayStore.subscribe(listener2);

      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOverlays', () => {
    it('should return current overlays without subscription', () => {
      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      expect(overlayStore.getOverlays()).toEqual([testOverlay]);
    });

    it('should return same reference as getSnapshot', () => {
      const testOverlay: OverlayData = {
        id: 'test-1',
        content: () => null,
        isOpen: true,
        data: 'test',
        onClose: vi.fn(),
      };

      overlayStore.setOverlays([testOverlay]);

      const overlays = overlayStore.getOverlays();
      const snapshot = overlayStore.getSnapshot();

      expect(overlays).toBe(snapshot);
    });
  });

  describe('React 18 useSyncExternalStore compatibility', () => {
    it('should have stable subscribe function reference', () => {
      const subscribe1 = overlayStore.subscribe;
      const subscribe2 = overlayStore.subscribe;

      expect(subscribe1).toBe(subscribe2);
    });

    it('should have stable getSnapshot function reference', () => {
      const getSnapshot1 = overlayStore.getSnapshot;
      const getSnapshot2 = overlayStore.getSnapshot;

      expect(getSnapshot1).toBe(getSnapshot2);
    });

    it('should have stable getServerSnapshot function reference', () => {
      const getServerSnapshot1 = overlayStore.getServerSnapshot;
      const getServerSnapshot2 = overlayStore.getServerSnapshot;

      expect(getServerSnapshot1).toBe(getServerSnapshot2);
    });
  });
});
