import type { Component } from 'vue';

/**
 * Overlay 옵션
 *
 * @example
 * ```typescript
 * interface FormData {
 *   title: string
 *   onSubmit: (data: unknown) => void
 * }
 *
 * const options: OverlayOptions = {
 *   data: {
 *     title: 'User Form',
 *     onSubmit: (data) => console.log(data)
 *   },
 *   beforeClose: async () => {
 *     return window.confirm('저장하지 않고 나가시겠습니까?')
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface OverlayOptions<TData = unknown> {
  /** 컴포넌트에 전달할 data */
  data?: Record<string, unknown>;

  /**
   * 닫기 전 실행할 가드 함수
   *
   * @returns false를 반환하면 닫기가 취소됩니다
   *
   * @remarks
   * async 함수를 지원하여 사용자 확인 등의 비동기 작업을 수행할 수 있습니다.
   */
  beforeClose?: () => boolean | Promise<boolean>;

  /**
   * 컴포넌트 마운트 후 실행할 콜백
   *
   * @remarks
   * DOM이 렌더링된 후 실행되므로 DOM 조작이 필요한 경우 사용합니다.
   */
  onMounted?: () => void;

  /**
   * 컴포넌트 언마운트 후 실행할 콜백
   *
   * @remarks
   * cleanup 작업이 필요한 경우 사용합니다.
   */
  onUnmounted?: () => void;
}

/**
 * Overlay 상태 (내부 사용)
 *
 * @typeParam TData - data 타입
 * @typeParam TResult - 닫기 결과 타입
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface OverlayState<TData = unknown, TResult = unknown> {
  /** SSR-safe 고유 ID */
  id: string;
  /** 렌더링할 Vue 컴포넌트 (markRaw 처리됨) */
  component: Component;
  /** 컴포넌트에 전달할 data */
  data: Record<string, unknown>;
  /** 열림/닫힘 상태 */
  isOpen: boolean;
  /** Promise resolve 함수 */
  resolve?: (result: OverlayResult<TResult>) => void;
  /** Promise reject 함수 */
  reject?: (error: OverlayError) => void;
  /** 닫기 전 실행할 가드 함수 */
  beforeClose?: () => boolean | Promise<boolean>;
  /** 마운트 후 실행할 콜백 */
  onMounted?: () => void;
  /** 언마운트 후 실행할 콜백 */
  onUnmounted?: () => void;
}

/**
 * Overlay 닫기 결과
 *
 * @typeParam TResult - 결과 데이터 타입
 *
 * @example
 * ```typescript
 * const result: OverlayResult<boolean> = await overlay.openOverlay(ConfirmDialog)
 *
 * if (result.type === 'close' && result.data === true) {
 *   console.log('사용자가 확인을 눌렀습니다')
 * }
 * ```
 */
export interface OverlayResult<TResult = unknown> {
  /**
   * 닫기 타입
   *
   * - `'close'`: 정상 닫기 (close 메서드 호출)
   * - `'dismiss'`: 강제 제거 (dismiss 메서드 호출)
   */
  type: 'close' | 'dismiss';

  /**
   * 결과 데이터
   *
   * @remarks
   * close() 호출 시 전달된 데이터가 여기 담깁니다.
   */
  data?: TResult;
}

/**
 * Overlay 에러 (Promise reject 시 전달)
 *
 * @example
 * ```typescript
 * try {
 *   await overlay.openOverlay(Dialog)
 * } catch (error: OverlayError) {
 *   if (error.type === 'dismiss') {
 *     console.log('사용자가 취소했습니다:', error.reason)
 *   }
 * }
 * ```
 */
export interface OverlayError {
  /**
   * 에러 타입
   *
   * - `'dismiss'`: dismiss 메서드로 제거됨
   * - `'error'`: 기타 에러
   */
  type: 'dismiss' | 'error';

  /**
   * 에러 사유
   *
   * @remarks
   * dismiss(reason) 호출 시 전달된 reason이 여기 담깁니다.
   */
  reason?: unknown;
}

/**
 * Overlay 컨트롤러
 *
 * @typeParam TResult - 닫기 결과 데이터 타입
 *
 * @remarks
 * useOverlayController composable에서 반환되어 외부에서 overlay를 직접 제어할 수 있습니다.
 *
 * @example
 * ```typescript
 * const controller = useOverlayController(Dialog, { data: {...} })
 *
 * // Promise로 대기
 * const result = await controller.result
 *
 * // 직접 제어
 * controller.close(data)
 * controller.dismiss('cancelled')
 * ```
 */
export interface OverlayController<TResult = unknown> {
  /** Overlay 고유 ID */
  id: string;
  /** Promise that resolves when overlay is closed */
  result: Promise<OverlayResult<TResult>>;
  /** Overlay 닫기 (Promise resolve) */
  close: (result?: TResult) => Promise<void>;
  /** Overlay 즉시 제거 (Promise reject) */
  dismiss: (reason?: unknown) => void;
}
