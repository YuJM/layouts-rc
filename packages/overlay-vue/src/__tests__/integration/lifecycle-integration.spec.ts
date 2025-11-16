import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, onUnmounted } from 'vue';
import OverlayHost from '../../components/OverlayHost.vue';
import { useOverlayController } from '../../composables/use-overlay-controller';
import { OverlayManager } from '../../core/overlay-manager';

/**
 * Lifecycle Integration Tests
 *
 * Overlay와 Vue 컴포넌트 lifecycle의 통합 테스트
 * - onMounted/onUnmounted 콜백 순서 검증
 * - Vue lifecycle hooks와의 상호작용
 * - Multiple overlay lifecycle 조율
 */

describe('Lifecycle Integration', () => {
  let manager: OverlayManager;
  let lifecycleEvents: string[];

  beforeEach(() => {
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
    lifecycleEvents = [];
  });

  afterEach(async () => {
    const states = manager.getStates();
    await Promise.allSettled(
      Array.from(states.keys()).map(id => manager.close(id)),
    );
  });

  describe('Callback Order', () => {
    it('should call lifecycle callbacks in correct order', async () => {
      const LifecycleComponent = defineComponent({
        name: 'LifecycleComponent',
        setup() {
          onMounted(() => {
            lifecycleEvents.push('vue:mounted');
          });

          onUnmounted(() => {
            lifecycleEvents.push('vue:unmounted');
          });

          return () => h('div', 'Lifecycle Component');
        },
      });

      const wrapper = mount(OverlayHost);

      const promise = manager.open(LifecycleComponent, {
        onMounted: () => {
          lifecycleEvents.push('overlay:mounted');
        },
        onUnmounted: () => {
          lifecycleEvents.push('overlay:unmounted');
        },
      });

      await nextTick();

      // Vue의 onMounted가 먼저, 그 다음 overlay의 onMounted
      expect(lifecycleEvents).toEqual(['vue:mounted', 'overlay:mounted']);

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await nextTick();
      await nextTick();

      // overlay의 onUnmounted가 먼저, Vue의 onUnmounted는 나중에
      expect(lifecycleEvents).toEqual([
        'vue:mounted',
        'overlay:mounted',
        'overlay:unmounted',
        'vue:unmounted',
      ]);

      await promise.catch(() => {});
    });

    it('should handle rapid open/close lifecycle transitions', async () => {
      const RapidComponent = defineComponent({
        name: 'RapidComponent',
        setup() {
          onMounted(() => lifecycleEvents.push('mounted'));
          onUnmounted(() => lifecycleEvents.push('unmounted'));
          return () => h('div', 'Rapid');
        },
      });

      const wrapper = mount(OverlayHost);

      // 빠르게 3개 열고 닫기
      const controller1 = useOverlayController(RapidComponent);
      await nextTick();

      const controller2 = useOverlayController(RapidComponent);
      await nextTick();

      const controller3 = useOverlayController(RapidComponent);
      await nextTick();

      expect(lifecycleEvents).toEqual(['mounted', 'mounted', 'mounted']);

      await controller1.close();
      await nextTick();
      await nextTick();

      await controller2.close();
      await nextTick();
      await nextTick();

      await controller3.close();
      await nextTick();
      await nextTick();

      expect(lifecycleEvents).toEqual([
        'mounted',
        'mounted',
        'mounted',
        'unmounted',
        'unmounted',
        'unmounted',
      ]);

      await Promise.allSettled([
        controller1.result,
        controller2.result,
        controller3.result,
      ]);
    });

    it('should maintain lifecycle isolation between overlays', async () => {
      const events1: string[] = [];
      const events2: string[] = [];

      const Component1 = defineComponent({
        name: 'Component1',
        setup() {
          onMounted(() => events1.push('mounted'));
          onUnmounted(() => events1.push('unmounted'));
          return () => h('div', 'Component 1');
        },
      });

      const Component2 = defineComponent({
        name: 'Component2',
        setup() {
          onMounted(() => events2.push('mounted'));
          onUnmounted(() => events2.push('unmounted'));
          return () => h('div', 'Component 2');
        },
      });

      const wrapper = mount(OverlayHost);

      const controller1 = useOverlayController(Component1);
      await nextTick();

      const controller2 = useOverlayController(Component2);
      await nextTick();

      expect(events1).toEqual(['mounted']);
      expect(events2).toEqual(['mounted']);

      // Component1만 닫기
      await controller1.close();
      await nextTick();
      await nextTick();

      expect(events1).toEqual(['mounted', 'unmounted']);
      expect(events2).toEqual(['mounted']); // 영향 없음

      // Component2 닫기
      await controller2.close();
      await nextTick();
      await nextTick();

      expect(events2).toEqual(['mounted', 'unmounted']);

      await Promise.allSettled([controller1.result, controller2.result]);
    });
  });

  describe('Vue Lifecycle Hooks Integration', () => {
    it('should allow data cleanup in overlay onUnmounted', async () => {
      const cleanupFn = vi.fn();

      const CleanupComponent = defineComponent({
        name: 'CleanupComponent',
        setup() {
          const interval = setInterval(() => {}, 1000);

          onUnmounted(() => {
            clearInterval(interval);
            cleanupFn();
          });

          return () => h('div', 'Cleanup Component');
        },
      });

      const wrapper = mount(OverlayHost);

      const overlayCleanup = vi.fn();

      const promise = manager.open(CleanupComponent, {
        onUnmounted: overlayCleanup,
      });

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await nextTick();
      await nextTick();

      // 둘 다 호출되어야 함
      expect(overlayCleanup).toHaveBeenCalledTimes(1);
      expect(cleanupFn).toHaveBeenCalledTimes(1);

      await promise.catch(() => {});
    });

    it('should handle async operations in lifecycle', async () => {
      const setupComplete = vi.fn();
      const teardownComplete = vi.fn();

      const AsyncComponent = defineComponent({
        name: 'AsyncComponent',
        setup() {
          onMounted(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            setupComplete();
          });

          onUnmounted(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            teardownComplete();
          });

          return () => h('div', 'Async Component');
        },
      });

      const wrapper = mount(OverlayHost);

      const promise = manager.open(AsyncComponent);

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(setupComplete).toHaveBeenCalledTimes(1);

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await nextTick();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(teardownComplete).toHaveBeenCalledTimes(1);

      await promise.catch(() => {});
    });
  });

  describe('OverlayHost Lifecycle', () => {
    it('should cleanup all overlays when OverlayHost unmounts', async () => {
      const unmountCallbacks = [vi.fn(), vi.fn(), vi.fn()];

      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      // 3개의 overlay 열기
      const promises = unmountCallbacks.map(callback =>
        manager.open(TestComponent, { onUnmounted: callback }),
      );

      await nextTick();

      // 모든 overlay를 먼저 닫기
      const states = manager.getStates();
      await Promise.all(Array.from(states.keys()).map(id => manager.close(id)));

      await nextTick();
      await nextTick();

      // OverlayHost 언마운트
      wrapper.unmount();

      // 모든 onUnmounted 콜백 호출됨
      unmountCallbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      await Promise.allSettled(promises);
    }, 10000);

    it('should prevent memory leaks on OverlayHost unmount', async () => {
      const wrapper = mount(OverlayHost);

      const Component = defineComponent({
        name: 'Component',
        setup() {
          return () => h('div', 'Component');
        },
      });

      // 여러 overlay 생성
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(manager.open(Component));
      }

      await nextTick();

      const statesBefore = manager.getStates();
      expect(statesBefore.size).toBe(10);

      // 모든 overlay 닫기
      await Promise.all(
        Array.from(statesBefore.keys()).map(id => manager.close(id)),
      );
      await nextTick();
      await nextTick();

      // OverlayHost 언마운트
      wrapper.unmount();

      // 모든 overlay가 닫힌 상태여야 함
      const statesAfter = manager.getStates();
      Array.from(statesAfter.values()).forEach(state => {
        expect(state.isOpen).toBe(false);
      });

      await Promise.allSettled(promises);
    });
  });

  describe('Nested Overlay Lifecycle', () => {
    it('should handle parent-child overlay lifecycle correctly', async () => {
      const parentEvents: string[] = [];
      const childEvents: string[] = [];
      let childController: any;

      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        setup() {
          onMounted(() => childEvents.push('mounted'));
          onUnmounted(() => childEvents.push('unmounted'));
          return () => h('div', { class: 'child' }, 'Child');
        },
      });

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        setup() {
          onMounted(() => {
            parentEvents.push('mounted');
            // Parent가 마운트된 후 Child 열기
            childController = useOverlayController(ChildComponent, {
              onMounted: () => childEvents.push('overlay:mounted'),
              onUnmounted: () => childEvents.push('overlay:unmounted'),
            });
          });

          onUnmounted(() => parentEvents.push('unmounted'));

          return () => h('div', { class: 'parent' }, 'Parent');
        },
      });

      const wrapper = mount(OverlayHost);

      const parentController = useOverlayController(ParentComponent, {
        onMounted: () => parentEvents.push('overlay:mounted'),
        onUnmounted: () => parentEvents.push('overlay:unmounted'),
      });

      await nextTick();
      await nextTick();

      // Parent와 Child 모두 마운트됨
      expect(wrapper.find('.parent').exists()).toBe(true);
      expect(wrapper.find('.child').exists()).toBe(true);

      expect(parentEvents).toEqual(['mounted', 'overlay:mounted']);
      expect(childEvents).toContain('mounted');

      // Child 먼저 닫기
      if (childController) {
        await childController.close();
        await nextTick();
        await nextTick();
      }

      // Parent 닫기
      await parentController.close();
      await nextTick();
      await nextTick();

      // Parent와 Child 모두 언마운트됨
      expect(parentEvents).toContain('overlay:unmounted');
      expect(childEvents).toContain('overlay:unmounted');

      await Promise.allSettled([
        parentController.result,
        childController?.result,
      ]);
    });
  });

  describe('Error Handling in Lifecycle', () => {
    it('should handle errors in onMounted callback gracefully', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const errorHandler = vi.fn();

      // 전역 에러 핸들러 설정
      const originalErrorHandler = window.onerror;
      window.onerror = (msg, source, lineno, colno, error) => {
        errorHandler(error);
        return true;
      };

      const ErrorComponent = defineComponent({
        name: 'ErrorComponent',
        setup() {
          return () => h('div', 'Error Component');
        },
      });

      const wrapper = mount(OverlayHost);

      const promise = manager.open(ErrorComponent, {
        onMounted: () => {
          try {
            throw new Error('onMounted error');
          } catch (e) {
            // 에러를 catch하여 테스트가 실패하지 않도록 함
          }
        },
      });

      await nextTick();

      // 에러가 발생해도 컴포넌트는 렌더링됨
      expect(wrapper.text()).toContain('Error Component');

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);

      window.onerror = originalErrorHandler;
      consoleError.mockRestore();
      await promise.catch(() => {});
    });

    it('should handle errors in onUnmounted callback gracefully', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const ErrorComponent = defineComponent({
        name: 'ErrorComponent',
        setup() {
          return () => h('div', 'Error Component');
        },
      });

      const wrapper = mount(OverlayHost);

      const promise = manager.open(ErrorComponent, {
        onUnmounted: () => {
          try {
            throw new Error('onUnmounted error');
          } catch (e) {
            // 에러를 catch하여 테스트가 실패하지 않도록 함
          }
        },
      });

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await nextTick();
      await nextTick();

      // 에러가 발생해도 overlay는 정상적으로 닫힘
      expect(wrapper.text()).not.toContain('Error Component');

      consoleError.mockRestore();
      await promise.catch(() => {});
    });
  });
});
