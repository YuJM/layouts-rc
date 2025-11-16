import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useOverlayController } from '../use-overlay-controller';
import { OverlayManager } from '../../core/overlay-manager';

// 테스트용 더미 컴포넌트
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  setup() {
    return () => h('div', 'Dummy Component');
  },
});

describe('useOverlayController', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    // 각 테스트마다 새로운 매니저 인스턴스
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
  });

  afterEach(async () => {
    // 모든 미처리 Promise rejection 방지
    const states = manager.getStates();
    await Promise.allSettled(
      Array.from(states.values()).map(state => manager.close(state.id)),
    );
  });

  describe('기본 기능', () => {
    it('컨트롤러 객체를 반환해야 함', () => {
      const controller = useOverlayController(DummyComponent);

      expect(controller).toHaveProperty('id');
      expect(controller).toHaveProperty('close');
      expect(controller).toHaveProperty('dismiss');
      expect(controller).toHaveProperty('result');

      // Unhandled rejection 방지
      controller.result.catch(() => {});
    });

    it('고유한 ID를 가져야 함', () => {
      const controller1 = useOverlayController(DummyComponent);
      const controller2 = useOverlayController(DummyComponent);

      expect(controller1.id).toBeDefined();
      expect(controller2.id).toBeDefined();
      expect(controller1.id).not.toBe(controller2.id);

      // Unhandled rejection 방지
      controller1.result.catch(() => {});
      controller2.result.catch(() => {});
    });

    it('result는 Promise여야 함', () => {
      const controller = useOverlayController(DummyComponent);

      expect(controller.result).toBeInstanceOf(Promise);
      // Unhandled rejection 방지
      controller.result.catch(() => {});
    });
  });

  describe('open 시 동작', () => {
    it('OverlayManager.open()을 호출해야 함', () => {
      const openSpy = vi.spyOn(manager, 'open');

      const controller = useOverlayController(DummyComponent);

      expect(openSpy).toHaveBeenCalledWith(DummyComponent, undefined);

      // Unhandled rejection 방지
      controller.result.catch(() => {});
    });

    it('options를 전달할 수 있어야 함', () => {
      const openSpy = vi.spyOn(manager, 'open');
      const options = { data: { title: 'Test' } };

      const controller = useOverlayController(DummyComponent, options);

      expect(openSpy).toHaveBeenCalledWith(DummyComponent, options);

      // Unhandled rejection 방지
      controller.result.catch(() => {});
    });

    it('overlay가 열린 상태로 추가되어야 함', () => {
      const controller = useOverlayController(DummyComponent);
      const states = manager.getStates();

      expect(states.has(controller.id)).toBe(true);
      expect(states.get(controller.id)?.isOpen).toBe(true);

      // Unhandled rejection 방지
      controller.result.catch(() => {});
    });
  });

  describe('close()', () => {
    it('컨트롤러의 close()를 호출하면 overlay가 닫혀야 함', async () => {
      const controller = useOverlayController(DummyComponent);
      const states = manager.getStates();

      await controller.close();

      expect(states.get(controller.id)?.isOpen).toBe(false);
    });

    it('결과와 함께 닫을 수 있어야 함', async () => {
      const controller = useOverlayController<unknown, { confirmed: boolean }>(
        DummyComponent,
      );

      const resultPromise = controller.result;
      await controller.close({ confirmed: true });
      const result = await resultPromise;

      expect(result.type).toBe('close');
      expect(result.data).toEqual({ confirmed: true });
    });

    it('result Promise가 resolve되어야 함', async () => {
      const controller = useOverlayController(DummyComponent);

      const resultPromise = controller.result;
      await controller.close('test-result');
      const result = await resultPromise;

      expect(result.type).toBe('close');
      expect(result.data).toBe('test-result');
    });
  });

  describe('dismiss()', () => {
    it('컨트롤러의 dismiss()를 호출하면 overlay가 제거되어야 함', () => {
      const controller = useOverlayController(DummyComponent);
      const states = manager.getStates();

      controller.dismiss();

      // Unhandled rejection 방지
      controller.result.catch(() => {});

      expect(states.get(controller.id)?.isOpen).toBe(false);
    });

    it('사유와 함께 제거할 수 있어야 함', async () => {
      const controller = useOverlayController(DummyComponent);

      const resultPromise = controller.result;
      controller.dismiss('user_cancelled');

      await expect(resultPromise).rejects.toEqual({
        type: 'dismiss',
        reason: 'user_cancelled',
      });
    });

    it('result Promise가 reject되어야 함', async () => {
      const controller = useOverlayController(DummyComponent);

      const resultPromise = controller.result;
      controller.dismiss('cancelled');

      await expect(resultPromise).rejects.toEqual({
        type: 'dismiss',
        reason: 'cancelled',
      });
    });
  });

  describe('타입 안정성', () => {
    it('제네릭 타입이 올바르게 작동해야 함', async () => {
      interface FormData {
        name: string;
        age: number;
      }

      const controller = useOverlayController<unknown, FormData>(
        DummyComponent,
      );

      const resultPromise = controller.result;
      await controller.close({ name: 'John', age: 30 });
      const result = await resultPromise;

      expect(result.data).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('여러 컨트롤러', () => {
    it('각 컨트롤러가 독립적으로 작동해야 함', async () => {
      const controller1 = useOverlayController(DummyComponent);
      const controller2 = useOverlayController(DummyComponent);

      const result1Promise = controller1.result;
      const result2Promise = controller2.result;

      await controller1.close('result1');
      await controller2.close('result2');

      const result1 = await result1Promise;
      const result2 = await result2Promise;

      expect(result1.data).toBe('result1');
      expect(result2.data).toBe('result2');
    });
  });

  describe('에지 케이스', () => {
    it('이미 닫힌 overlay를 다시 닫으려 해도 에러가 발생하지 않아야 함', async () => {
      const controller = useOverlayController(DummyComponent);

      // 첫 번째 close로 Promise가 resolve됨
      const resultPromise = controller.result;
      await controller.close();
      await resultPromise;

      // 두 번째 close는 아무 일도 일어나지 않음
      await expect(controller.close()).resolves.toBeUndefined();
    });

    it('이미 dismiss된 overlay를 다시 dismiss해도 에러가 발생하지 않아야 함', async () => {
      const controller = useOverlayController(DummyComponent);

      // 첫 번째 dismiss로 Promise가 reject됨
      controller.dismiss();

      // Promise rejection 처리
      await controller.result.catch(() => {});

      // 두 번째 dismiss는 아무 일도 일어나지 않음
      expect(() => controller.dismiss()).not.toThrow();
    });
  });
});
