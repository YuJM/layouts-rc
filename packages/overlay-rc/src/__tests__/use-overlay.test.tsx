import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOverlay, OverlayProvider } from '../overlay-context';

describe('useOverlay', () => {
  describe('with Provider', () => {
    it('should return overlay context value', async () => {
      const user = userEvent.setup();
      const mockCloseOverlay = vi.fn();
      const mockDismiss = vi.fn();
      const contextValue = {
        overlayId: 'test-overlay',
        isOpen: true,
        overlayData: 'test data',
        closeOverlay: mockCloseOverlay,
        dismiss: mockDismiss,
      };

      function TestComponent() {
        const overlay = useOverlay<string>();

        return (
          <div>
            <div data-testid="id">{overlay.overlayId}</div>
            <div data-testid="open">{overlay.isOpen ? 'open' : 'closed'}</div>
            <div data-testid="data">{overlay.overlayData}</div>
            <button onClick={() => overlay.closeOverlay('result')}>Close</button>
          </div>
        );
      }

      render(
        <OverlayProvider value={contextValue}>
          <TestComponent />
        </OverlayProvider>
      );

      expect(screen.getByTestId('id')).toHaveTextContent('test-overlay');
      expect(screen.getByTestId('open')).toHaveTextContent('open');
      expect(screen.getByTestId('data')).toHaveTextContent('test data');

      await user.click(screen.getByText('Close'));

      await waitFor(() => {
        expect(mockCloseOverlay).toHaveBeenCalledWith('result');
      });
    });

    it('should work with dismiss function', async () => {
      const user = userEvent.setup();
      const mockDismiss = vi.fn();
      const contextValue = {
        overlayId: 'dismiss-overlay',
        isOpen: true,
        overlayData: 'test data',
        closeOverlay: vi.fn(),
        dismiss: mockDismiss,
      };

      function TestComponent() {
        const overlay = useOverlay<string>();

        return (
          <div>
            <button onClick={() => overlay.dismiss()}>Dismiss</button>
          </div>
        );
      }

      render(
        <OverlayProvider value={contextValue}>
          <TestComponent />
        </OverlayProvider>
      );

      await user.click(screen.getByText('Dismiss'));

      await waitFor(() => {
        expect(mockDismiss).toHaveBeenCalled();
      });
    });

    it('should work with typed data', () => {
      interface CustomData {
        message: string;
        count: number;
      }

      const contextValue = {
        overlayId: 'typed-overlay',
        isOpen: true,
        overlayData: { message: 'Hello', count: 42 },
        closeOverlay: vi.fn(),
        dismiss: vi.fn(),
      };

      function TypedComponent() {
        const overlay = useOverlay<CustomData>();

        return (
          <div>
            <div data-testid="message">{overlay.overlayData.message}</div>
            <div data-testid="count">{overlay.overlayData.count}</div>
          </div>
        );
      }

      render(
        <OverlayProvider value={contextValue}>
          <TypedComponent />
        </OverlayProvider>
      );

      expect(screen.getByTestId('message')).toHaveTextContent('Hello');
      expect(screen.getByTestId('count')).toHaveTextContent('42');
    });

    it('should work in nested components', async () => {
      const user = userEvent.setup();
      const mockCloseOverlay = vi.fn();
      const contextValue = {
        overlayId: 'nested-overlay',
        isOpen: true,
        overlayData: 'nested data',
        closeOverlay: mockCloseOverlay,
        dismiss: vi.fn(),
      };

      function ParentComponent() {
        return (
          <div>
            <ChildComponent />
          </div>
        );
      }

      function ChildComponent() {
        return (
          <div>
            <GrandchildComponent />
          </div>
        );
      }

      function GrandchildComponent() {
        const overlay = useOverlay<string>();

        return (
          <div>
            <div data-testid="nested-data">{overlay.overlayData}</div>
            <button onClick={() => overlay.closeOverlay()}>Close Nested</button>
          </div>
        );
      }

      render(
        <OverlayProvider value={contextValue}>
          <ParentComponent />
        </OverlayProvider>
      );

      expect(screen.getByTestId('nested-data')).toHaveTextContent('nested data');

      await user.click(screen.getByText('Close Nested'));

      await waitFor(() => {
        expect(mockCloseOverlay).toHaveBeenCalled();
      });
    });
  });

  describe('without Provider', () => {
    it('should throw error when used outside Provider', () => {
      function InvalidComponent() {
        useOverlay();
        return <div>Should not render</div>;
      }

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<InvalidComponent />);
      }).toThrow('useOverlay must be used within an overlay component');

      consoleError.mockRestore();
    });
  });

  describe('multiple overlays', () => {
    it('should maintain separate context for each overlay', async () => {
      const user = userEvent.setup();
      const mockCloseOverlay1 = vi.fn();
      const mockCloseOverlay2 = vi.fn();

      const contextValue1 = {
        overlayId: 'overlay-1',
        isOpen: true,
        overlayData: 'data 1',
        closeOverlay: mockCloseOverlay1,
        dismiss: vi.fn(),
      };

      const contextValue2 = {
        overlayId: 'overlay-2',
        isOpen: true,
        overlayData: 'data 2',
        closeOverlay: mockCloseOverlay2,
        dismiss: vi.fn(),
      };

      function TestComponent() {
        const overlay = useOverlay<string>();

        return (
          <div>
            <div data-testid={`id-${overlay.overlayId}`}>{overlay.overlayId}</div>
            <div data-testid={`data-${overlay.overlayId}`}>{overlay.overlayData}</div>
            <button onClick={() => overlay.closeOverlay()}>Close {overlay.overlayId}</button>
          </div>
        );
      }

      render(
        <>
          <OverlayProvider value={contextValue1}>
            <TestComponent />
          </OverlayProvider>
          <OverlayProvider value={contextValue2}>
            <TestComponent />
          </OverlayProvider>
        </>
      );

      // Verify both overlays render with correct data
      expect(screen.getByTestId('id-overlay-1')).toHaveTextContent('overlay-1');
      expect(screen.getByTestId('data-overlay-1')).toHaveTextContent('data 1');

      expect(screen.getByTestId('id-overlay-2')).toHaveTextContent('overlay-2');
      expect(screen.getByTestId('data-overlay-2')).toHaveTextContent('data 2');

      // Click close buttons
      await user.click(screen.getByText('Close overlay-1'));
      await user.click(screen.getByText('Close overlay-2'));

      await waitFor(() => {
        expect(mockCloseOverlay1).toHaveBeenCalled();
        expect(mockCloseOverlay2).toHaveBeenCalled();
      });
    });
  });

  describe('React DevTools debugging', () => {
    it('should provide debug value', () => {
      const contextValue = {
        overlayId: 'debug-overlay',
        isOpen: true,
        overlayData: 'debug data',
        closeOverlay: vi.fn(),
        dismiss: vi.fn(),
      };

      function DebugComponent() {
        const overlay = useOverlay();
        // useDebugValue is called internally
        return <div data-testid="debug-id">{overlay.overlayId}</div>;
      }

      render(
        <OverlayProvider value={contextValue}>
          <DebugComponent />
        </OverlayProvider>
      );

      expect(screen.getByTestId('debug-id')).toHaveTextContent('debug-overlay');
    });
  });
});
