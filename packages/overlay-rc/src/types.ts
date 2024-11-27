import type { CSSProperties, FC, ReactNode } from 'react';
import type { OVERLAY_POSITION } from './constants';

export type OverlayId = string;
export type OverlayState = boolean;

export type OverlayPosition =
  (typeof OVERLAY_POSITION)[keyof typeof OVERLAY_POSITION];

export type OverlayKind = 'overlay' | 'sheet' | 'modal' | 'confirm';

export interface OverlayStyle {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  style?: CSSProperties;
  className?: string;
}

export interface OverlayConfig {
  title?: ReactNode;
  position?: OverlayPosition;
  overlayHidden?: boolean;
  kind?: OverlayKind;
}

export type OverlayCloseType<TResult = void> = (
  result?: TResult,
) => void | Promise<void>;

export interface OverlayContentProps<TData = unknown, TResult = void> {
  id: OverlayId;
  open: boolean;
  data: TData;
  close: OverlayCloseType<TResult>;
}

export type OverlayContentComponent<TData = unknown, TResult = void> = FC<
  OverlayContentProps<TData, TResult>
>;

export interface OverlayOpenOptions<TData = unknown, TResult = void>
  extends OverlayStyle,
    OverlayConfig {
  content: OverlayContentComponent<TData, TResult>;
  data?: TData;
  close?: OverlayCloseType<TResult>;
}

export interface OverlayRenderData<TData = unknown, TResult = void>
  extends Omit<OverlayOpenOptions<TData, TResult>, 'data'> {
  id: OverlayId;
  state: OverlayState;
  data: TData;
}

export interface CloseEventDetail<TResult = unknown> {
  overlayId: OverlayId;
  args: TResult[];
}
