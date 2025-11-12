import type { ComponentType } from 'react';

/**
 * Options for opening an overlay
 */
export interface OverlayOptions<TData = unknown, TResult = unknown> {
  /** Optional custom ID for the overlay (auto-generated if not provided) */
  id?: string;
  /** React component to render as overlay content (accesses data via useOverlay hook) */
  content: ComponentType;
  /** Data to pass to the overlay component */
  data?: TData;
  /** Callback executed before closing (return false to prevent closing) */
  beforeClose?: () => Promise<boolean> | boolean;
  /** Callback executed when overlay closes */
  onClose?: (result?: TResult) => void | Promise<void>;
  /** Callback executed when overlay opens successfully */
  onOpen?: (id: string) => void | Promise<void>;
}

/**
 * Internal overlay state managed by useOverlayManager
 */
export interface OverlayData<TData = unknown, TResult = unknown>
  extends OverlayOptions<TData, TResult> {
  /** Unique overlay ID (required) */
  id: string;
  /** Whether the overlay is currently open */
  isOpen: boolean;
  /** Timestamp when overlay was closed (for cleanup after exit animation) */
  closeTimestamp?: number;
}
