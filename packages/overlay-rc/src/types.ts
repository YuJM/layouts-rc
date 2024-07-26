import type { CSSProperties, FC, ReactNode } from 'react';

export type UnionToDiscriminatedType<T extends Record<string, any>> =
  T[keyof T];

type OverlayId = string;

export type OverlayCloseType<R = any> = (data?: R) => void;

export const OVERLAY_TOGGLE_STATE = {
  OPEN: true,
  CLOSE: false,
} as const;

export type OverlayToggleState = UnionToDiscriminatedType<
  typeof OVERLAY_TOGGLE_STATE
>;

export const OverlayPosition = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
} as const;

export type OverlayPositionType = UnionToDiscriminatedType<
  typeof OverlayPosition
>;

export interface OverlayContentProps<T = any, R = any> {
  id?: OverlayId;
  open: boolean;
  data: T;
  close: OverlayCloseType<R>;
}

/**
 * option에서 data값을 주지 않는다면 component에서 data는 null이다.
 */
export type OverlayContentComponent<T = any, R = any> = FC<
  OverlayContentProps<T, R>
>;

export interface OverlayOpenOption<T = any, R = any> {
  title?: ReactNode;
  content: OverlayContentComponent<T, R>;
  data?: T;
  close?: OverlayCloseType<R>;
  /*style*/
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  style?: CSSProperties;
  className?: string;
  position?: OverlayPositionType;
  overlayHidden?: boolean; // default off
  kind?: 'overlay' | 'sheet' | 'modal' | 'confirm';
  [key: string]: any;
}

export interface ContentRenderData<T = any, R = any>
  extends OverlayOpenOption<T, R> {
  id: OverlayId;
  state: OverlayToggleState;
  data: T; // override
  close: OverlayCloseType<R>;
}

export interface OverlayContextOption<T = any, R = any> {
  overlayOpen: (option: OverlayOpenOption<T, R>) => OverlayId;
  closeAllOverlay: VoidFunction;
}

/*close Event*/
export const OVERLAY_CLOSE_EVENT_NAME = 'dialog-close';

export interface CloseEventDetail {
  targetId: string;
  args: any[];
}
