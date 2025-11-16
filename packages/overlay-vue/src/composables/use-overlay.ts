import { computed } from 'vue';
import type { Component, ComputedRef } from 'vue';
import { OverlayManager } from '../core/overlay-manager';
import type {
  OverlayOptions,
  OverlayResult,
  OverlayState,
} from '../core/types';

/**
 * useOverlay 반환 타입
 */
export interface UseOverlayReturn {
  /** Overlay 열기 함수 */
  openOverlay: <TData = unknown, TResult = unknown>(
    component: Component,
    options?: OverlayOptions<TData>,
  ) => Promise<OverlayResult<TResult>>;
  /** Overlay 닫기 함수 */
  close: <TResult = unknown>(id: string, result?: TResult) => Promise<void>;
  /** 모든 Overlay 닫기 함수 */
  closeAll: () => Promise<void>;
  /** Overlay 존재 확인 함수 */
  has: (id: string) => boolean;
  /** Overlay 상태 조회 함수 */
  getOverlay: (id: string) => OverlayState | undefined;
  /** 모든 Overlay 상태 (reactive) */
  overlays: ComputedRef<ReadonlyMap<string, OverlayState>>;
}

/**
 * Overlay 관리를 위한 Composable
 *
 * @remarks
 * Vue Composition API를 활용한 선언적 overlay 관리.
 * OverlayManager의 Singleton 인스턴스를 래핑하여 Vue 컴포넌트에서 사용하기 쉽게 제공합니다.
 *
 * **주요 특징**:
 * - 🔄 Reactive: Vue의 반응형 시스템과 완전 통합
 * - 🎯 Type-safe: TypeScript 제네릭으로 완전한 타입 안정성
 * - 🌍 Singleton: 모든 컴포넌트에서 동일한 상태 공유
 * - ⚡ Promise-based: async/await로 간편한 비동기 처리
 *
 * @example
 * ```vue
 * <script setup>
 * import { useOverlay } from '@layout-rc/overlay-vue'
 * import MyDialog from './MyDialog.vue'
 *
 * const { openOverlay, close, overlays } = useOverlay()
 *
 * // 기본 사용
 * const handleOpen = async () => {
 *   try {
 *     const result = await openOverlay(MyDialog, {
 *       data: { title: 'Hello' }
 *     })
 *     console.log('Dialog closed with:', result)
 *   } catch (error) {
 *     console.log('Dialog dismissed:', error)
 *   }
 * }
 *
 * // 다중 인스턴스 공유
 * const overlay1 = useOverlay()
 * const overlay2 = useOverlay()
 * // overlay1과 overlay2는 같은 상태를 공유합니다
 * </script>
 * ```
 *
 * @see {@link OverlayOptions} - Overlay 옵션 타입
 * @see {@link OverlayResult} - Overlay 결과 타입
 * @see {@link OverlayState} - Overlay 상태 타입
 *
 * @returns Overlay 관리 함수들과 반응형 상태
 */
export function useOverlay(): UseOverlayReturn {
  // Singleton 인스턴스 참조
  const manager = OverlayManager.getInstance();

  /**
   * Overlay 열기
   *
   * @param component - 렌더링할 Vue 컴포넌트
   * @param options - Overlay 옵션
   * @returns Overlay 닫기 결과를 반환하는 Promise
   *
   * @example
   * ```typescript
   * // 기본 사용
   * const result = await openOverlay(ConfirmDialog)
   *
   * // data와 함께 열기
   * const result = await openOverlay(UserForm, {
   *   data: { userId: 123 }
   * })
   *
   * // beforeClose 가드와 함께 사용
   * const result = await openOverlay(EditForm, {
   *   beforeClose: async () => {
   *     return window.confirm('저장하지 않고 나가시겠습니까?')
   *   }
   * })
   * ```
   */
  function openOverlay<TData = unknown, TResult = unknown>(
    component: Component,
    options?: OverlayOptions<TData>,
  ): Promise<OverlayResult<TResult>> {
    return manager.open<TData, TResult>(component, options);
  }

  /**
   * Overlay 닫기
   *
   * @param id - Overlay ID
   * @param result - Overlay에서 반환할 결과값
   *
   * @remarks
   * beforeClose 가드가 false를 반환하면 닫기가 취소됩니다.
   *
   * @example
   * ```typescript
   * // 결과 없이 닫기
   * await close('overlay-id')
   *
   * // 결과와 함께 닫기
   * await close('overlay-id', { confirmed: true })
   * ```
   */
  async function close<TResult = unknown>(
    id: string,
    result?: TResult,
  ): Promise<void> {
    await manager.close<TResult>(id, result);
  }

  /**
   * 모든 Overlay 닫기
   *
   * @remarks
   * 열려있는 모든 overlay를 순차적으로 닫습니다.
   * 각 overlay의 beforeClose 가드가 실행됩니다.
   *
   * @example
   * ```typescript
   * await closeAll()
   * ```
   */
  async function closeAll(): Promise<void> {
    await manager.closeAll();
  }

  /**
   * 특정 Overlay 존재 확인
   *
   * @param id - Overlay ID
   * @returns 존재 여부
   *
   * @example
   * ```typescript
   * if (has('overlay-id')) {
   *   console.log('Overlay가 열려있습니다')
   * }
   * ```
   */
  function has(id: string): boolean {
    return manager.has(id);
  }

  /**
   * 특정 Overlay 상태 조회
   *
   * @param id - Overlay ID
   * @returns Overlay 상태 또는 undefined
   *
   * @example
   * ```typescript
   * const state = getOverlay('overlay-id')
   * if (state) {
   *   console.log('Overlay 상태:', state.isOpen)
   * }
   * ```
   */
  function getOverlay(id: string): OverlayState | undefined {
    return manager.getStates().get(id);
  }

  /**
   * 현재 모든 Overlay 상태 (reactive)
   *
   * @remarks
   * Vue의 computed ref로 래핑되어 있어, overlay 상태 변경에 자동으로 반응합니다.
   * Map 구조를 사용하므로 overlay ID로 빠르게 조회할 수 있습니다.
   * ReadonlyMap으로 타입이 지정되어 직접 수정할 수 없습니다.
   *
   * @example
   * ```vue
   * <template>
   *   <!-- Overlay 목록 렌더링 -->
   *   <div v-for="[id, state] in overlays" :key="id">
   *     {{ state.isOpen ? '열림' : '닫힘' }}
   *   </div>
   *
   *   <!-- Overlay 개수 표시 -->
   *   <p>현재 {{ overlays.size }}개의 overlay가 있습니다</p>
   * </template>
   *
   * <script setup>
   * const { overlays } = useOverlay()
   *
   * // Reactive: 상태 변경에 자동 반응
   * watchEffect(() => {
   *   console.log('Overlay count:', overlays.value.size)
   * })
   * </script>
   * ```
   */
  const overlays = computed<ReadonlyMap<string, OverlayState>>(() =>
    manager.getStates(),
  );

  return {
    openOverlay,
    close,
    closeAll,
    has,
    getOverlay,
    overlays,
  };
}
