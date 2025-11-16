import { inject, InjectionKey, type ComputedRef } from 'vue';

/**
 * Current Overlay 인터페이스
 *
 * @typeParam TData - Overlay에 전달된 data 타입
 * @typeParam TResult - 닫기 결과 데이터 타입
 *
 * @remarks
 * Overlay 내부에서 사용할 수 있는 컨텍스트 정보를 제공합니다.
 * OverlayHost가 자동으로 provide하며, overlay 컴포넌트에서 inject하여 사용합니다.
 */
export interface CurrentOverlay<TData = unknown, TResult = unknown> {
  /**
   * Overlay ID
   * @remarks 고유 식별자
   */
  id: string;

  /**
   * Overlay 열림/닫힘 상태
   * @remarks overlay가 열려있으면 true, 닫혀있으면 false
   */
  isOpen: boolean;

  /**
   * Overlay에 전달된 data
   * @remarks 타입 안정성을 위해 제네릭으로 타입 지정
   */
  data: TData;

  /**
   * Overlay 닫기 함수
   * @param result - 닫기 결과 데이터
   * @remarks beforeClose 가드를 통과하면 overlay를 닫습니다
   */
  close: (result?: TResult) => Promise<void>;

  /**
   * Overlay 즉시 제거 함수
   * @param reason - 제거 사유
   * @remarks beforeClose 가드를 무시하고 즉시 제거합니다
   */
  dismiss: (reason?: unknown) => void;
}

/**
 * Current Overlay Injection Key
 * @internal
 */
export const CURRENT_OVERLAY_KEY: InjectionKey<ComputedRef<CurrentOverlay>> =
  Symbol('current-overlay');

/**
 * Current Overlay Composable
 *
 * @typeParam TData - Overlay data 타입
 * @typeParam TResult - 닫기 결과 타입
 *
 * @returns Current overlay 컨텍스트 (id, data, close, dismiss)
 *
 * @throws {Error} Overlay 컨텍스트 외부에서 호출 시 에러
 *
 * @remarks
 * **Overlay 내부에서만 사용 가능**합니다.
 * OverlayHost가 자동으로 provide하는 컨텍스트를 inject합니다.
 *
 * **주요 용도**:
 * - Overlay 내부에서 자신의 ID 조회
 * - Overlay에 전달된 data 접근
 * - Overlay 스스로 닫기 (self-closing)
 * - 타입 안전한 데이터 접근
 *
 * **overlay-rc와의 차이점**:
 * - React: `useOverlay()` hook으로 overlay 내부에서 사용
 * - Vue: `useCurrentOverlay()` composable로 provide/inject 패턴 사용
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCurrentOverlay } from '@layout-rc/overlay-vue'
 *
 * // 기본 사용
 * const overlay = useCurrentOverlay()
 *
 * function handleClose() {
 *   overlay.close({ confirmed: true })
 * }
 *
 * function handleCancel() {
 *   overlay.dismiss('user_cancelled')
 * }
 * </script>
 *
 * <template>
 *   <div class="dialog">
 *     <h2>Overlay ID: {{ overlay.id }}</h2>
 *     <button @click="handleClose">Confirm</button>
 *     <button @click="handleCancel">Cancel</button>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCurrentOverlay } from '@layout-rc/overlay-vue'
 *
 * // 타입 안전한 사용
 * interface DialogData {
 *   title: string
 *   message: string
 * }
 *
 * interface DialogResult {
 *   confirmed: boolean
 *   input?: string
 * }
 *
 * const overlay = useCurrentOverlay<DialogData, DialogResult>()
 *
 * // overlay.data는 DialogData 타입
 * console.log(overlay.data.title)
 *
 * function handleConfirm(input: string) {
 *   // close는 DialogResult 타입을 받음
 *   overlay.close({ confirmed: true, input })
 * }
 * </script>
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCurrentOverlay } from '@layout-rc/overlay-vue'
 * import { onMounted } from 'vue'
 *
 * // Self-closing overlay (5초 후 자동 닫기)
 * const overlay = useCurrentOverlay()
 *
 * onMounted(() => {
 *   setTimeout(() => {
 *     overlay.close()
 *   }, 5000)
 * })
 * </script>
 *
 * <template>
 *   <div class="toast">
 *     {{ overlay.data.message }}
 *   </div>
 * </template>
 * ```
 *
 * @see {@link CurrentOverlay} - 컨텍스트 인터페이스
 * @see {@link useOverlay} - Overlay 관리 composable
 * @see {@link useOverlayController} - Overlay 컨트롤러
 */
export function useCurrentOverlay<
  TData = unknown,
  TResult = unknown,
>(): CurrentOverlay<TData, TResult> {
  const context =
    inject<ComputedRef<CurrentOverlay<TData, TResult>>>(CURRENT_OVERLAY_KEY);

  if (!context) {
    throw new Error(
      '[overlay-vue] useCurrentOverlay must be called within an overlay component. ' +
        'Make sure you are using this composable inside a component rendered by OverlayHost.',
    );
  }

  return context.value;
}
