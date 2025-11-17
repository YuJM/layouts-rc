import { createContext, useContext, useDebugValue } from 'react';

/**
 * Overlay context value containing overlay-specific data and controls
 */
export interface OverlayContextValue<TData = unknown, TResult = unknown> {
  /** Unique identifier for this overlay instance */
  overlayId: string;
  /** Whether this overlay is currently open */
  isOpen: boolean;
  /** Data passed to this overlay */
  overlayData: TData;
  /** Function to close this overlay with optional result */
  closeOverlay: (result?: TResult) => void;
  /** Function to dismiss (cancel) this overlay without returning a result */
  dismiss: () => void;
}

/**
 * Context for providing overlay data to components
 * Each overlay instance gets its own Provider with unique values
 */
const OverlayContext = createContext<OverlayContextValue | null>(null);

/**
 * Hook to access the current overlay's context
 * Must be used within a component rendered by OverlayContainer
 *
 * @example
 * ```tsx
 * function MyOverlay() {
 *   const { overlayId, overlayData, closeOverlay } = useOverlay<string>();
 *
 *   return (
 *     <Dialog onClose={() => closeOverlay()}>
 *       <p>{overlayData}</p>
 *     </Dialog>
 *   );
 * }
 * ```
 */
export function useOverlay<TData = unknown, TResult = unknown>(): OverlayContextValue<TData, TResult> {
  const context = useContext(OverlayContext);

  // React DevTools debugging support
  useDebugValue(context ? `Overlay(${context.overlayId})` : 'No Overlay Context');

  if (!context) {
    throw new Error(
      'useOverlay must be used within an overlay component rendered by OverlayContainer. ' +
      'Make sure your component is passed to openOverlay() as the content prop.'
    );
  }

  return context as OverlayContextValue<TData, TResult>;
}

/**
 * Provider component for overlay context
 * Used internally by OverlayContainer to wrap each overlay
 */
export const OverlayProvider = OverlayContext.Provider;
