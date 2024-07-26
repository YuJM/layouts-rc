// types.ts
import { Component, CSSProperties, Ref, UnwrapRef } from 'vue';

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

export type OverlayContentComponent<T = any, R = any> = Component<
  OverlayContentProps<T, R>
>;

export interface OverlayOpenOption<T = any, R = any> {
  title?: any;
  content: OverlayContentComponent<T, R>;
  data?: UnwrapRef<T>;
  close?: OverlayCloseType<R>;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  style?: CSSProperties;
  class?: string | object | Array<string | object>;
  position?: OverlayPositionType;
  overlayHidden?: boolean;
  kind?: 'overlay' | 'sheet' | 'modal' | 'confirm';

  [key: string]: any;
}

export interface ContentRenderData<T = any, R = any>
  extends OverlayOpenOption<T, R> {
  id: OverlayId;
  state: OverlayToggleState;
  data: UnwrapRef<T>;
  close: OverlayCloseType<R>;
}

export interface OverlayContextOption<T = any, R = any> {
  overlayOpen: (option: OverlayOpenOption<T, R>) => OverlayId;
  closeAllOverlay: VoidFunction;
}

export const OVERLAY_CLOSE_EVENT_NAME = 'dialog-close';

export interface CloseEventDetail {
  targetId: string;
  args: any[];
}

export interface OverlayRegisterReturn<T = any, R = any> {
  overlays: Ref<ContentRenderData<T, R>[]>;
  overlayOpen: (option: OverlayOpenOption<T, R>) => string;
  closeAllOverlay: () => void;
}
