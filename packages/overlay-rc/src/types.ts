import type { CSSProperties, FC } from 'react';

export interface OverlayContentProps<TData, TResult = unknown> {
  close: (result?: TResult) => void;
  data: TData;
  open: boolean;
}
export type OverlayContent<TData, TResult = unknown> = FC<
  OverlayContentProps<TData, TResult>
>; // Overlay 데이터 타입 정의
// Overlay 타입 정의
export interface OverlayOptions<TData, TResult = unknown> {
  id?: string;
  content: OverlayContent<TData, TResult>;
  data?: TData;
  position?: OverlayPosition;
  kind?: OverlayKind;
  title?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  className?: string;
  onClose?: (result?: TResult) => void | Promise<void>;
}

export type OverlayId = string;
export type OverlayPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type OverlayKind = 'overlay' | 'modal' | 'drawer';

export interface OverlayData<TData, TResult>
  extends OverlayOptions<TData, TResult> {
  id: OverlayId;
  open: boolean;
}
