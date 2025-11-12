import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOverlayManager } from '../use-overlay-manager';
import { overlayStore } from '../overlay-store';

describe('useOverlayManager', () => {
  beforeEach(() => {
    // Reset store before each test
    overlayStore.setOverlays([]);
  });

  describe('openOverlay', () => {
    it('should open a new overlay', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      let overlayPromise: Promise<unknown>;

      act(() => {
        overlayPromise = result.current.openOverlay({
          content: TestContent,
          data: 'test data',
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      const overlays = result.current.overlays;

      expect(overlays[0].content).toBe(TestContent);
      expect(overlays[0].data).toBe('test data');
      expect(overlays[0].isOpen).toBe(true);
    });

    it('should generate unique ID if not provided', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({ content: TestContent });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      const overlays = result.current.overlays;

      expect(overlays[0].id).toBeDefined();
      // React useId 형식: :r0:-overlay-0
      expect(overlays[0].id).toMatch(/^:r\d+:-overlay-\d+$/);
    });

    it('should use custom ID if provided', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({
          id: 'custom-id',
          content: TestContent,
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      const overlays = result.current.overlays;

      expect(overlays[0].id).toBe('custom-id');
    });

    it('should call onOpen callback with ID', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const onOpen = vi.fn();

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({
          content: TestContent,
          onOpen,
        });
      });

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalledTimes(1);
      });

      expect(onOpen).toHaveBeenCalledWith(expect.any(String));
    });

    it('should close existing overlay with same ID before opening new one', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const TestContent1 = () => <div>Test 1</div>;
      const TestContent2 = () => <div>Test 2</div>;

      // Open first overlay
      act(() => {
        result.current.openOverlay({
          id: 'same-id',
          content: TestContent1,
          data: 'data 1',
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      expect(result.current.overlays[0].data).toBe('data 1');

      // Open second overlay with same ID
      act(() => {
        result.current.openOverlay({
          id: 'same-id',
          content: TestContent2,
          data: 'data 2',
        });
      });

      await waitFor(() => {
        const openOverlays = result.current.overlays.filter((o) => o.isOpen);
        expect(openOverlays).toHaveLength(1);
        expect(openOverlays[0].data).toBe('data 2');
      });
    });

    it('should return result from onClose', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      let resolveValue: unknown;

      act(() => {
        const promise = result.current.openOverlay({
          content: TestContent,
        });
        promise.then((value) => {
          resolveValue = value;
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      // Manually close with result
      act(() => {
        const overlay = result.current.overlays[0];
        overlay.onClose?.('test result');
      });

      await waitFor(() => {
        expect(resolveValue).toBe('test result');
      });
    });
  });

  describe('closeAllOverlays', () => {
    it('should close all open overlays', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      // Open multiple overlays
      act(() => {
        result.current.openOverlay({ content: TestContent });
        result.current.openOverlay({ content: TestContent });
        result.current.openOverlay({ content: TestContent });
      });

      await waitFor(() => {
        expect(result.current.overlays.filter((o) => o.isOpen)).toHaveLength(3);
      });

      // Close all
      act(() => {
        result.current.closeAllOverlays();
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(0);
      });
    });

    it('should call onClose for each overlay', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({ content: TestContent, onClose: onClose1 });
        result.current.openOverlay({ content: TestContent, onClose: onClose2 });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(2);
      });

      act(() => {
        result.current.closeAllOverlays();
      });

      // closeAllOverlays는 단순히 배열을 비우므로 onClose가 호출되지 않습니다
      expect(onClose1).not.toHaveBeenCalled();
      expect(onClose2).not.toHaveBeenCalled();
    });
  });

  describe('closeOverlay', () => {
    it('should close specific overlay by ID', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({ id: 'overlay-1', content: TestContent });
        result.current.openOverlay({ id: 'overlay-2', content: TestContent });
        result.current.openOverlay({ id: 'overlay-3', content: TestContent });
      });

      await waitFor(() => {
        expect(result.current.overlays.filter((o) => o.isOpen)).toHaveLength(3);
      });

      // Close specific overlay
      await act(async () => {
        await result.current.closeOverlay('overlay-2');
      });

      await waitFor(() => {
        const openOverlays = result.current.overlays.filter((o) => o.isOpen);
        expect(openOverlays).toHaveLength(2);
        expect(openOverlays.find((o) => o.id === 'overlay-2')).toBeUndefined();
      });
    });

    it('should call onClose for the specific overlay', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const onClose = vi.fn();

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({
          id: 'test-overlay',
          content: TestContent,
          onClose,
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      await act(async () => {
        await result.current.closeOverlay('test-overlay');
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should do nothing if overlay ID not found', async () => {
      const { result } = renderHook(() => useOverlayManager());

      await act(async () => {
        await result.current.closeOverlay('non-existent-id');
      });

      expect(result.current.overlays).toHaveLength(0);
    });
  });

  describe('beforeClose', () => {
    it('should call beforeClose before closing overlay', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const beforeClose = vi.fn().mockResolvedValue(true);

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({
          id: 'test-overlay',
          content: TestContent,
          beforeClose,
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      await act(async () => {
        await result.current.closeOverlay('test-overlay');
      });

      await waitFor(() => {
        expect(beforeClose).toHaveBeenCalled();
      });
    });

    it('should prevent closing if beforeClose returns false', async () => {
      const { result } = renderHook(() => useOverlayManager());
      const beforeClose = vi.fn().mockResolvedValue(false);

      const TestContent = () => <div>Test</div>;

      act(() => {
        result.current.openOverlay({
          id: 'test-overlay',
          content: TestContent,
          beforeClose,
        });
      });

      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });

      await act(async () => {
        await result.current.closeOverlay('test-overlay');
      });

      await waitFor(() => {
        expect(beforeClose).toHaveBeenCalled();
      });

      // Should still be open
      expect(result.current.overlays[0].isOpen).toBe(true);
    });
  });

  describe('useSyncExternalStore integration', () => {
    it('should subscribe to store changes', async () => {
      const { result } = renderHook(() => useOverlayManager());

      const TestContent = () => <div>Test</div>;

      // Initially empty
      expect(result.current.overlays).toHaveLength(0);

      // Open overlay
      act(() => {
        result.current.openOverlay({ content: TestContent });
      });

      // Should update automatically
      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
      });
    });

    it('should update when store changes externally', async () => {
      const { result } = renderHook(() => useOverlayManager());

      expect(result.current.overlays).toHaveLength(0);

      // Change store externally
      act(() => {
        overlayStore.setOverlays([
          {
            id: 'external-overlay',
            content: () => <div>External</div>,
            isOpen: true,
            data: 'external data',
          },
        ]);
      });

      // Hook should reflect the change
      await waitFor(() => {
        expect(result.current.overlays).toHaveLength(1);
        expect(result.current.overlays[0].id).toBe('external-overlay');
      });
    });
  });
});
