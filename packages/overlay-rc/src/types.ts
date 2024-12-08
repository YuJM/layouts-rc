import type { CSSProperties, FC } from 'react';


// OverlayId, OverlayPosition, OverlayKind 타입 정의
export type OverlayId = string;
export type OverlayPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type OverlayKind = 'overlay' | 'modal' | 'drawer';

// OverlayContentProps 타입 정의: Overlay 컴포넌트가 받을 props
export interface OverlayContentProps<TData = unknown, TResult = unknown> {
  close: (result?: TResult) => void; // Overlay를 닫는 함수
  data: TData; // Overlay에 전달되는 데이터
  open: boolean; // Overlay가 열려 있는지 여부 (사용하지 않음)
  id: string; // 해당 컴포넌트의 ID
}

// OverlayContent 타입 정의: Overlay 컴포넌트의 타입
export type OverlayContent<TData = unknown, TResult = unknown> = FC<
    OverlayContentProps<TData, TResult>
>;

// OverlayOptions 타입 정의: openOverlay 함수에 전달되는 옵션
export interface OverlayOptions<TData = unknown, TResult = unknown> {
  id?: string; // Overlay ID (선택적)
  content: OverlayContent<TData, TResult>; // Overlay 컴포넌트
  data?: TData; // Overlay에 전달되는 데이터 (선택적)
  position?: OverlayPosition; // Overlay 위치 (선택적)
  kind?: OverlayKind; // Overlay 종류 (선택적)
  title?: string; // Overlay 제목 (선택적)
  width?: string | number; // Overlay 너비 (선택적)
  height?: string | number; // Overlay 높이 (선택적)
  style?: CSSProperties; // Overlay 스타일 (선택적)
  className?: string; // Overlay 클래스 이름 (선택적)
  onClose?: (result?: TResult) => void | Promise<void>; // 닫기 콜백 (선택적)
  onOpen?: (id: string) => void | Promise<void>; // openOverlay 성공시 불리는 callback
}

// OverlayData 타입 정의: useOverlayManager에서 관리하는 Overlay 상태
export interface OverlayData<TData = unknown, TResult = unknown>
    extends OverlayOptions<TData, TResult> {
  id: string; // Overlay ID (필수)
  open: boolean; // Overlay가 열려 있는지 여부
  beforeClose?: () => Promise<boolean> | boolean; // 닫기 전 확인 콜백 (선택적)
}

