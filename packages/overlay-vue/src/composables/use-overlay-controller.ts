import type { Component } from 'vue';
import { OverlayManager } from '../core/overlay-manager';
import type {
  OverlayOptions,
  OverlayResult,
  OverlayController,
} from '../core/types';

/**
 * useOverlayController 반환 타입
 *
 * @typeParam TData - 컴포넌트에 전달할 props 타입
 * @typeParam TResult - 닫기 결과 데이터 타입
 *
 * @remarks
 * OverlayController에 result Promise를 추가한 확장 타입입니다.
 * Promise 방식과 직접 제어 방식을 모두 지원하여 유연한 API를 제공합니다.
 *
 * @see {@link OverlayController} - 기본 컨트롤러 인터페이스
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UseOverlayControllerReturn<TData = unknown, TResult = unknown>
  extends OverlayController<TResult> {
  /** Overlay 결과를 반환하는 Promise */
  result: Promise<OverlayResult<TResult>>;
}

/**
 * Overlay 컨트롤러 생성 Composable
 *
 * @typeParam TData - 컴포넌트에 전달할 props 타입
 * @typeParam TResult - 닫기 결과 데이터 타입
 *
 * @param component - 렌더링할 Vue 컴포넌트
 * @param options - Overlay 옵션
 * @returns Overlay 컨트롤러 (id, close, dismiss, result)
 *
 * @remarks
 * useOverlay().open()의 대안으로, Promise와 직접 제어 메서드를 모두 제공합니다.
 *
 * **useOverlay vs useOverlayController**:
 * - `useOverlay`: 전역 상태 관리, 여러 overlay를 조회/관리
 * - `useOverlayController`: 단일 overlay 제어, Promise + 메서드 모두 사용 가능
 *
 * **주요 특징**:
 * - 🎯 Direct Control: close/dismiss 메서드로 직접 제어
 * - ⚡ Promise Support: result로 결과를 await 가능
 * - 🔑 ID Access: overlay ID에 직접 접근 가능
 * - 🎨 Flexible API: Promise 또는 메서드 호출 선택 가능
 *
 * @example
 * ```vue
 * <script setup>
 * import { useOverlayController } from '@layout-rc/overlay-vue'
 * import ConfirmDialog from './ConfirmDialog.vue'
 *
 * // 기본 사용 - Promise 방식
 * const handleConfirm = async () => {
 *   const controller = useOverlayController(ConfirmDialog, {
 *     props: { message: '정말 삭제하시겠습니까?' }
 *   })
 *
 *   try {
 *     const result = await controller.result
 *     if (result.data === true) {
 *       console.log('사용자가 확인을 눌렀습니다')
 *     }
 *   } catch (error) {
 *     console.log('사용자가 취소했습니다')
 *   }
 * }
 *
 * // 직접 제어 방식
 * const handleEdit = () => {
 *   const controller = useOverlayController(EditForm, {
 *     props: { userId: 123 }
 *   })
 *
 *   // 5초 후 자동으로 닫기
 *   setTimeout(() => {
 *     controller.close({ saved: true })
 *   }, 5000)
 *
 *   // ESC 키로 취소
 *   const handleEscape = (e: KeyboardEvent) => {
 *     if (e.key === 'Escape') {
 *       controller.dismiss('user_cancelled')
 *     }
 *   }
 *   window.addEventListener('keydown', handleEscape)
 *
 *   // Promise로 결과 대기도 가능
 *   controller.result
 *     .then(result => console.log('저장됨:', result.data))
 *     .catch(error => console.log('취소됨:', error.reason))
 *     .finally(() => {
 *       window.removeEventListener('keydown', handleEscape)
 *     })
 * }
 * </script>
 * ```
 *
 * @example
 * ```typescript
 * // 타입 안정성 있는 사용
 * interface FormData {
 *   name: string
 *   age: number
 * }
 *
 * const controller = useOverlayController<unknown, FormData>(UserForm)
 *
 * // TypeScript가 타입을 추론합니다
 * controller.close({ name: 'John', age: 30 }) // ✅ OK
 * controller.close({ invalid: 'data' }) // ❌ Type Error
 * ```
 *
 * @example
 * ```typescript
 * // 타임아웃이 있는 알림
 * function showNotification(message: string, duration = 3000) {
 *   const controller = useOverlayController(Notification, {
 *     props: { message }
 *   })
 *
 *   // 자동으로 닫기
 *   setTimeout(() => {
 *     controller.close()
 *   }, duration)
 *
 *   return controller
 * }
 *
 * // 로딩 인디케이터
 * async function withLoading<T>(asyncFn: () => Promise<T>): Promise<T> {
 *   const controller = useOverlayController(LoadingSpinner)
 *
 *   try {
 *     const result = await asyncFn()
 *     controller.close()
 *     return result
 *   } catch (error) {
 *     controller.dismiss(error)
 *     throw error
 *   }
 * }
 * ```
 *
 * @see {@link useOverlay} - 전역 overlay 상태 관리
 * @see {@link OverlayController} - 컨트롤러 인터페이스
 * @see {@link OverlayOptions} - Overlay 옵션
 * @see {@link OverlayResult} - Overlay 결과
 */
export function useOverlayController<TData = unknown, TResult = unknown>(
  component: Component,
  options?: OverlayOptions<TData>,
): UseOverlayControllerReturn<TData, TResult> {
  // Singleton 인스턴스 참조
  const manager = OverlayManager.getInstance();

  // 현재 상태 크기 저장 (새 overlay ID 추적용)
  const beforeSize = manager.getStates().size;

  // Overlay 열기 및 Promise 저장
  const resultPromise = manager.open<TData, TResult>(component, options);

  // ID 추출: open() 직후 추가된 overlay의 ID를 찾음
  const states = manager.getStates();
  const allIds = Array.from(states.keys());
  const id = allIds[beforeSize] as string;

  /**
   * Overlay 닫기
   *
   * @param result - Overlay에서 반환할 결과값
   *
   * @remarks
   * beforeClose 가드가 false를 반환하면 닫기가 취소됩니다.
   */
  async function close(result?: TResult): Promise<void> {
    await manager.close<TResult>(id, result);
  }

  /**
   * Overlay 즉시 제거 (dismiss)
   *
   * @param reason - 제거 사유
   *
   * @remarks
   * Promise를 reject하고 즉시 제거합니다.
   * beforeClose 가드를 무시합니다.
   */
  function dismiss(reason?: unknown): void {
    manager.dismiss(id, reason);
  }

  return {
    id,
    close,
    dismiss,
    result: resultPromise,
  };
}
