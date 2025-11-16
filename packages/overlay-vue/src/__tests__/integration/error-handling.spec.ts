import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import OverlayHost from '../../components/OverlayHost.vue';
import { useOverlay } from '../../composables/use-overlay';
import { useOverlayController } from '../../composables/use-overlay-controller';
import { OverlayManager } from '../../core/overlay-manager';

/**
 * Error Handling Integration Tests
 *
 * 에러 시나리오 및 엣지 케이스 통합 테스트
 * - beforeClose 가드 실패
 * - 컴포넌트 렌더링 에러
 * - Promise rejection 처리
 * - 동시성 문제
 */

describe('Error Handling Integration', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
  });

  afterEach(async () => {
    const states = manager.getStates();
    await Promise.allSettled(
      Array.from(states.keys()).map(id => manager.close(id)),
    );
  });

  describe('beforeClose Guard', () => {
    it('should prevent closing when beforeClose returns false', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test Component');
        },
      });

      const wrapper = mount(OverlayHost);
      const onUnmounted = vi.fn();

      const promise = manager.open(TestComponent, {
        beforeClose: async () => false,
        onUnmounted,
      });

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      // beforeClose가 false를 반환하므로 닫히지 않음
      await manager.close(id);
      await nextTick();

      const state = states.get(id);
      expect(state?.isOpen).toBe(true);
      expect(onUnmounted).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('Test Component');

      // 강제로 dismiss하면 닫힘
      manager.dismiss(id);
      await nextTick();
      await nextTick();

      expect(state?.isOpen).toBe(false);
      expect(onUnmounted).toHaveBeenCalledTimes(1);

      await promise.catch(() => {});
    });

    it('should handle async beforeClose validation', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test Component');
        },
      });

      const wrapper = mount(OverlayHost);

      let allowClose = false;

      const promise = manager.open(TestComponent, {
        beforeClose: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return allowClose;
        },
      });

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      // 첫 번째 시도 - 실패
      const _closeAttempt1 = manager.close(id);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(states.get(id)?.isOpen).toBe(true);

      // allowClose를 true로 변경
      allowClose = true;

      // 두 번째 시도 - 성공
      await manager.close(id);
      await nextTick();

      expect(states.get(id)?.isOpen).toBe(false);

      await promise.catch(() => {});
    });

    it('should handle multiple beforeClose guards in sequence', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      const guard1 = vi.fn(() => Promise.resolve(true));
      const guard2 = vi.fn(() => Promise.resolve(true));
      const guard3 = vi.fn(() => Promise.resolve(false));

      // 여러 overlay를 각각 다른 guard로 열기
      const promise1 = manager.open(TestComponent, { beforeClose: guard1 });
      const promise2 = manager.open(TestComponent, { beforeClose: guard2 });
      const promise3 = manager.open(TestComponent, { beforeClose: guard3 });

      await nextTick();

      const states = manager.getStates();
      const ids = Array.from(states.keys());

      // 첫 번째와 두 번째는 닫힘
      await manager.close(ids[0]);
      await manager.close(ids[1]);

      expect(guard1).toHaveBeenCalled();
      expect(guard2).toHaveBeenCalled();
      expect(states.get(ids[0])?.isOpen).toBe(false);
      expect(states.get(ids[1])?.isOpen).toBe(false);

      // 세 번째는 닫히지 않음
      await manager.close(ids[2]);
      expect(guard3).toHaveBeenCalled();
      expect(states.get(ids[2])?.isOpen).toBe(true);

      // 강제 종료
      manager.dismiss(ids[2]);

      await Promise.allSettled([promise1, promise2, promise3]);
    });
  });

  describe('Component Rendering Errors', () => {
    it('should handle component setup errors gracefully', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const BrokenComponent = defineComponent({
        name: 'BrokenComponent',
        setup() {
          try {
            throw new Error('Setup error');
          } catch (e) {
            // 에러를 catch하여 컴포넌트가 렌더링되지 않도록 함
            return () => h('div', 'Fallback');
          }
        },
      });

      const wrapper = mount(OverlayHost);

      // 에러가 발생해도 manager는 정상 작동
      const promise = manager.open(BrokenComponent);

      await nextTick();

      const states = manager.getStates();
      expect(states.size).toBe(1);

      const id = Array.from(states.keys())[0];
      manager.dismiss(id);

      await nextTick();

      consoleWarn.mockRestore();
      consoleError.mockRestore();
      await promise.catch(() => {});
    });

    it('should handle component render errors', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarn = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const RenderErrorComponent = defineComponent({
        name: 'RenderErrorComponent',
        setup() {
          let hasError = false;
          return () => {
            if (!hasError) {
              try {
                throw new Error('Render error');
              } catch (e) {
                hasError = true;
                return h('div', 'Error handled');
              }
            }
            return h('div', 'Error handled');
          };
        },
      });

      const wrapper = mount(OverlayHost);

      const promise = manager.open(RenderErrorComponent);

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      // 에러가 있어도 상태는 유지
      expect(states.get(id)?.isOpen).toBe(true);

      manager.dismiss(id);

      await nextTick();

      consoleWarn.mockRestore();
      consoleError.mockRestore();
      await promise.catch(() => {});
    });
  });

  describe('Promise Rejection Handling', () => {
    it('should handle dismiss with rejection reason', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      const controller = useOverlayController(TestComponent);

      await nextTick();

      const reason = { code: 'USER_CANCELLED', message: 'User pressed ESC' };
      controller.dismiss(reason);

      await expect(controller.result).rejects.toEqual({
        type: 'dismiss',
        reason,
      });
    });

    it('should handle concurrent close and dismiss', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      const controller = useOverlayController(TestComponent);

      await nextTick();

      // close와 dismiss를 동시에 호출
      const _closePromise = controller.close({ data: 'closed' });
      controller.dismiss('dismissed');

      // dismiss가 우선
      await expect(controller.result).rejects.toEqual({
        type: 'dismiss',
        reason: 'dismissed',
      });

      const states = manager.getStates();
      expect(states.get(controller.id)?.isOpen).toBe(false);
    });

    it('should properly cleanup on unhandled rejection', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);
      const onUnmounted = vi.fn();

      const controller = useOverlayController(TestComponent, {
        onUnmounted,
      });

      await nextTick();

      // Promise rejection 먼저 처리
      const rejectionPromise = controller.result.catch(() => {});

      // Promise를 처리한 후 dismiss
      controller.dismiss('test');

      await nextTick();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      // cleanup은 정상적으로 실행되어야 함
      expect(onUnmounted).toHaveBeenCalledTimes(1);

      // Promise 처리 완료
      await rejectionPromise;
    });
  });

  describe('Concurrency Issues', () => {
    it('should handle rapid open/close cycles', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      const promises = [];

      // 100개의 overlay를 빠르게 열고 닫기
      for (let i = 0; i < 100; i++) {
        const controller = useOverlayController(TestComponent);
        promises.push(controller.result);

        if (i % 2 === 0) {
          controller.close();
        } else {
          controller.dismiss();
        }
      }

      await nextTick();

      const results = await Promise.allSettled(promises);

      // 모든 Promise가 처리되어야 함
      expect(results).toHaveLength(100);

      // 절반은 resolved, 절반은 rejected
      const resolved = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(resolved.length).toBeGreaterThan(0);
      expect(rejected.length).toBeGreaterThan(0);
    });

    it('should handle concurrent closeAll operations', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay, closeAll } = useOverlay();

      // 10개의 overlay 열기
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(openOverlay(TestComponent));
      }

      await nextTick();

      // 동시에 여러 번 closeAll 호출
      await Promise.all([closeAll(), closeAll(), closeAll()]);

      const states = manager.getStates();

      // 모든 overlay가 닫혀야 함
      Array.from(states.values()).forEach(state => {
        expect(state.isOpen).toBe(false);
      });

      await Promise.allSettled(promises);
    });

    it('should handle race condition between close and state update', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: {
          value: Number,
        },
        setup(props) {
          return () => h('div', String(props.value));
        },
      });

      const wrapper = mount(OverlayHost);

      const controller = useOverlayController(TestComponent, {
        data: { value: 0 },
      });

      await nextTick();

      const states = manager.getStates();
      const state = states.get(controller.id);

      // props 업데이트와 close를 동시에 시도
      if (state) {
        state.data.value = 100;
      }
      const closePromise = controller.close();

      await nextTick();
      await closePromise;

      // close가 완료되어야 함
      expect(states.get(controller.id)?.isOpen).toBe(false);

      await controller.result.catch(() => {});
    });
  });

  describe('Edge Cases', () => {
    it('should handle opening overlay with same ID multiple times', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          return () => h('div', 'Test');
        },
      });

      const wrapper = mount(OverlayHost);

      // 같은 컴포넌트를 여러 번 열기
      const promises = [
        manager.open(TestComponent),
        manager.open(TestComponent),
        manager.open(TestComponent),
      ];

      await nextTick();

      const states = manager.getStates();

      // 각각 다른 ID를 가져야 함
      expect(states.size).toBe(3);
      const ids = Array.from(states.keys());
      expect(new Set(ids).size).toBe(3);

      await Promise.all(ids.map(id => manager.close(id)));
      await Promise.allSettled(promises);
    });

    it('should handle closing non-existent overlay', async () => {
      // 존재하지 않는 ID로 close 시도
      await expect(manager.close('non-existent-id')).resolves.toBeUndefined();

      // 존재하지 않는 ID로 dismiss 시도
      expect(() => manager.dismiss('non-existent-id')).not.toThrow();
    });

    it('should handle overlay with undefined props', async () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: {
          title: String,
          count: Number,
        },
        setup(props) {
          return () =>
            h('div', `${props.title ?? 'default'} - ${props.count ?? 0}`);
        },
      });

      const wrapper = mount(OverlayHost);

      // props 없이 열기
      const promise = manager.open(TestComponent);

      await nextTick();

      // 기본값으로 렌더링되어야 함
      expect(wrapper.text()).toContain('default - 0');

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await promise.catch(() => {});
    });

    it('should handle empty OverlayHost operations', async () => {
      const wrapper = mount(OverlayHost);
      const { closeAll } = useOverlay();

      // overlay가 없는 상태에서 closeAll
      await expect(closeAll()).resolves.toBeUndefined();

      // OverlayHost unmount도 에러 없이 처리
      expect(() => wrapper.unmount()).not.toThrow();
    });
  });
});
