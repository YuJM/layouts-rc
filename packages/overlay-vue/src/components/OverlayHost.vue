<script setup lang="ts">
/**
 * OverlayHost Component
 *
 * @description
 * OverlayManager에 등록된 모든 overlay를 렌더링하는 호스트 컴포넌트.
 * 동적 컴포넌트 렌더링과 lifecycle 콜백을 관리합니다.
 *
 * @remarks
 * - OverlayManager의 reactive 상태를 구독하여 자동으로 업데이트됩니다
 * - onMounted/onUnmounted 콜백을 적절한 시점에 호출합니다
 * - 각 overlay는 고유 ID로 key를 부여받아 효율적으로 렌더링됩니다
 *
 * @example
 * ```vue
 * <template>
 *   <div id="app">
 *     <YourMainContent />
 *     <OverlayHost />
 *   </div>
 * </template>
 * ```
 */
import { computed, onUnmounted, watch, defineComponent, h, provide } from 'vue';
import { OverlayManager } from '../core/overlay-manager';
import type { OverlayState } from '../core/types';
import {
  CURRENT_OVERLAY_KEY,
  type CurrentOverlay,
} from '../composables/use-current-overlay';

/**
 * OverlayManager singleton 인스턴스
 */
const manager = OverlayManager.getInstance();

/**
 * 모든 overlay 상태를 담고 있는 reactive computed
 * @returns Array<[string, OverlayState]> - Map entries를 배열로 변환
 */
const overlays = computed(() => Array.from(manager.getStates().entries()));

/**
 * 마운트된 컴포넌트 추적
 * Map<overlay ID, OverlayState>
 */
const mountedComponents = new Map<string, OverlayState>();

/**
 * 이미 onUnmounted가 호출된 컴포넌트 ID 집합
 */
const unmountedComponents = new Set<string>();

/**
 * 이전 상태 스냅샷 (언마운트 감지용)
 * Map<overlay ID, OverlayState snapshot>
 */
const previousStates = new Map<string, OverlayState>();

/**
 * 컴포넌트 마운트 시 호출되는 핸들러
 *
 * @param id - Overlay ID
 *
 * @remarks
 * - onMounted 콜백이 있으면 실행
 * - 모든 컴포넌트의 마운트 상태를 추적하여 언마운트 감지에 활용
 */
function handleMounted(id: string): void {
  const entry = overlays.value.find(([overlayId]) => overlayId === id);
  if (!entry) return;

  const [, state] = entry;

  // onMounted 콜백 실행
  if (state.onMounted && !mountedComponents.has(id)) {
    state.onMounted();
  }

  // 컴포넌트 마운트 상태 기록 (onMounted 콜백 유무와 무관)
  if (!mountedComponents.has(id)) {
    mountedComponents.set(id, state);
    previousStates.set(id, { ...state });
  }
}

/**
 * 언마운트된 overlay를 감지하고 onUnmounted 콜백 실행
 *
 * @remarks
 * - 이전 상태(previousStates)와 현재 상태를 비교
 * - isOpen이 true → false로 변경된 overlay 감지
 * - 해당 overlay의 onUnmounted 콜백 실행
 */
function checkUnmounted(): void {
  const currentStates = overlays.value;

  // 이전 상태와 비교하여 닫힌 overlay 찾기
  for (const [id, prevState] of previousStates) {
    const currentEntry = currentStates.find(([overlayId]) => overlayId === id);
    const currentState = currentEntry?.[1];

    // 언마운트 조건 체크:
    // 1. 이전에 마운트되었고
    // 2. 이전에는 열려있었는데
    // 3. 지금은 닫혀있고
    // 4. 아직 onUnmounted가 호출되지 않았음
    const shouldCallUnmounted =
      mountedComponents.has(id) &&
      prevState.isOpen &&
      (!currentState || !currentState.isOpen) &&
      !unmountedComponents.has(id);

    if (shouldCallUnmounted) {
      // onUnmounted 콜백 실행
      if (prevState.onUnmounted) {
        prevState.onUnmounted();
        unmountedComponents.add(id);
      }
      mountedComponents.delete(id);
      previousStates.delete(id);
    }
  }

  // 현재 상태를 previousStates에 복사 (다음 비교를 위해)
  for (const [id, state] of currentStates) {
    previousStates.set(id, { ...state });
  }
}

/**
 * Overlay 상태 변경 감지 watcher
 *
 * @remarks
 * - overlays 배열의 isOpen 값 변화를 감시
 * - 변화 감지 시 checkUnmounted() 실행
 * - flush: 'post'로 DOM 업데이트 이후에 실행
 */
watch(
  () =>
    overlays.value.map(([id, state]) => ({
      id,
      isOpen: state.isOpen,
    })),
  () => {
    checkUnmounted();
  },
  { deep: true, flush: 'post' },
);

/**
 * OverlayHost 언마운트 시 정리 작업
 *
 * @remarks
 * - 남아있는 모든 마운트된 컴포넌트의 onUnmounted 콜백 실행
 * - 메모리 누수 방지를 위해 모든 Map/Set 초기화
 */
onUnmounted(() => {
  // 남아있는 마운트된 컴포넌트들의 onUnmounted 실행
  for (const [id, state] of mountedComponents) {
    if (state?.onUnmounted && !unmountedComponents.has(id)) {
      state.onUnmounted();
      unmountedComponents.add(id);
    }
  }

  // 메모리 정리
  mountedComponents.clear();
  unmountedComponents.clear();
  previousStates.clear();
});

/**
 * OverlayProvider Component
 *
 * @description
 * 각 overlay에 context를 provide하는 wrapper 컴포넌트
 */
const OverlayProvider = defineComponent({
  name: 'OverlayProvider',
  props: {
    id: {
      type: String,
      required: true,
    },
    state: {
      type: Object as () => OverlayState,
      required: true,
    },
  },
  emits: ['mounted'],
  setup(props, { emit }) {
    // Overlay context 생성 - computed로 isOpen을 reactive하게 만듦
    const context = computed<CurrentOverlay>(() => ({
      id: props.id,
      isOpen: props.state.isOpen,
      data: props.state.data,
      close: async (result?: unknown) => {
        await manager.close(props.id, result);
      },
      dismiss: (reason?: unknown) => {
        manager.dismiss(props.id, reason);
      },
    }));

    // Context provide - computed ref를 provide (reactivity 유지)
    provide(CURRENT_OVERLAY_KEY, context);

    return () =>
      h(props.state.component, {
        ...props.state.data,
        onVnodeMounted: () => emit('mounted'),
      });
  },
});
</script>

<template>
  <template v-for="[id, state] in overlays" :key="id">
    <OverlayProvider
      v-if="state.isOpen"
      :id="id"
      :state="state"
      @mounted="handleMounted(id)"
    />
  </template>
</template>
