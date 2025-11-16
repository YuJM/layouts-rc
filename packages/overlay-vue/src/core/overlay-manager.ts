import { reactive, markRaw } from 'vue';
import type { Component } from 'vue';
import type { OverlayState, OverlayOptions, OverlayResult } from './types';

/**
 * 애니메이션 기본 지연 시간 (ms)
 */
const DEFAULT_CLEANUP_DELAY = 300;

/**
 * Overlay 관리 클래스 (Singleton)
 *
 * @remarks
 * Vue 3 reactive 시스템을 활용한 중앙 집중식 overlay 상태 관리.
 * Promise 기반 API로 overlay 열기/닫기를 간편하게 처리합니다.
 *
 * @example
 * ```typescript
 * const manager = OverlayManager.getInstance()
 *
 * const result = await manager.open(MyDialog, {
 *   data: { title: 'Hello' }
 * })
 * ```
 */
export class OverlayManager {
  private static instance: OverlayManager | null = null;

  /** Reactive state store */
  private states = reactive(new Map<string, OverlayState>());

  /** ID 생성용 카운터 (SSR-safe) */
  private nextId = 0;

  /** Private constructor for Singleton */
  private constructor() {}

  /**
   * Singleton 인스턴스 반환
   *
   * @returns OverlayManager 인스턴스
   *
   * @example
   * ```typescript
   * const manager = OverlayManager.getInstance()
   * ```
   */
  static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  /**
   * SSR-safe 고유 ID 생성
   *
   * @remarks
   * timestamp + 증가 카운터 조합으로 SSR 환경에서도 안전하게 사용 가능
   */
  private generateId(): string {
    return `overlay-${Date.now()}-${++this.nextId}`;
  }

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
   * const result = await manager.open(ConfirmDialog)
   *
   * // data와 함께 열기
   * const result = await manager.open(UserForm, {
   *   data: { userId: 123 }
   * })
   *
   * // beforeClose 가드와 함께 사용
   * const result = await manager.open(EditForm, {
   *   beforeClose: () => {
   *     return window.confirm('저장하지 않고 나가시겠습니까?')
   *   }
   * })
   * ```
   */
  open<TData = unknown, TResult = unknown>(
    component: Component,
    options?: OverlayOptions<TData>,
  ): Promise<OverlayResult<TResult>> {
    const id = this.generateId();

    return new Promise((resolve, reject) => {
      const state: OverlayState<TData, TResult> = {
        id,
        // markRaw: 컴포넌트는 반응형 추적 불필요 (성능 최적화)
        component: markRaw(component),
        data: options?.data || {},
        isOpen: true,
        resolve,
        reject,
        beforeClose: options?.beforeClose,
        onMounted: options?.onMounted,
        onUnmounted: options?.onUnmounted,
      };

      this.states.set(id, state);
    });
  }

  /**
   * Overlay 닫기
   *
   * @param id - Overlay ID
   * @param result - Overlay에서 반환할 결과값
   *
   * @remarks
   * beforeClose 가드가 false를 반환하면 닫기가 취소됩니다.
   * 닫기 후 애니메이션 시간만큼 지연 후 자동으로 cleanup됩니다.
   *
   * @example
   * ```typescript
   * // 결과 없이 닫기
   * manager.close('overlay-id')
   *
   * // 결과와 함께 닫기
   * manager.close('overlay-id', { confirmed: true })
   * ```
   */
  async close<TResult = unknown>(id: string, result?: TResult): Promise<void> {
    const state = this.states.get(id);
    if (!state) return;

    // beforeClose 실행 (async 지원)
    const canClose = await Promise.resolve(state.beforeClose?.() ?? true);
    if (!canClose) return;

    state.isOpen = false;
    state.resolve?.({ type: 'close', data: result });

    // 애니메이션 후 cleanup
    this.scheduleCleanup(id);
  }

  /**
   * Overlay 즉시 제거 (dismiss)
   *
   * @param id - Overlay ID
   * @param reason - 제거 사유
   *
   * @remarks
   * Promise를 reject하고 즉시 제거합니다.
   * beforeClose 가드를 무시합니다.
   *
   * @example
   * ```typescript
   * manager.dismiss('overlay-id', 'user_cancelled')
   * ```
   */
  dismiss(id: string, reason?: unknown): void {
    const state = this.states.get(id);
    if (!state) return;

    state.isOpen = false;
    state.reject?.({ type: 'dismiss', reason });

    this.scheduleCleanup(id);
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
   * manager.closeAll()
   * ```
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.states.keys()).map(id =>
      this.close(id),
    );
    await Promise.all(closePromises);
  }

  /**
   * Cleanup 스케줄링 (애니메이션 대기)
   *
   * @param id - Overlay ID
   * @param delay - 지연 시간 (ms)
   *
   * @remarks
   * 애니메이션이 완료된 후 상태에서 제거하여 메모리 누수를 방지합니다.
   */
  private scheduleCleanup(id: string, delay = DEFAULT_CLEANUP_DELAY): void {
    setTimeout(() => {
      this.states.delete(id);
    }, delay);
  }

  /**
   * 현재 모든 Overlay 상태 조회
   *
   * @returns 읽기 전용 상태 Map
   *
   * @remarks
   * 반환된 Map은 읽기 전용이므로 직접 수정할 수 없습니다.
   *
   * @example
   * ```typescript
   * const states = manager.getStates()
   * console.log(`현재 ${states.size}개의 overlay가 열려있습니다`)
   * ```
   */
  getStates(): ReadonlyMap<string, OverlayState> {
    return this.states;
  }

  /**
   * 특정 Overlay 존재 확인
   *
   * @param id - Overlay ID
   * @returns 존재 여부
   *
   * @example
   * ```typescript
   * if (manager.has('overlay-id')) {
   *   console.log('Overlay가 열려있습니다')
   * }
   * ```
   */
  has(id: string): boolean {
    return this.states.has(id);
  }
}

/** Singleton 인스턴스 export */
export const overlayManager = OverlayManager.getInstance();
