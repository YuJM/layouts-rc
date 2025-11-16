import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OverlayManager } from '../overlay-manager';
import { defineComponent, h } from 'vue';

// 테스트용 더미 컴포넌트
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  setup() {
    return () => h('div', 'Dummy Component');
  },
});

describe('OverlayManager', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    manager = new OverlayManager();
  });

  describe('Singleton Pattern', () => {
    it('동일한 인스턴스를 반환해야 함', () => {
      const manager1 = OverlayManager.getInstance();
      const manager2 = OverlayManager.getInstance();
      expect(manager1).toBe(manager2);
    });
  });

  describe('open()', () => {
    it('overlay를 열고 Promise를 반환해야 함', () => {
      const promise = manager.open(DummyComponent);
      expect(promise).toBeInstanceOf(Promise);
      // Unhandled rejection 방지
      promise.catch(() => {});
    });

    it('overlay를 열면 상태에 추가되어야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      expect(states.size).toBe(1);
    });

    it('고유한 ID를 생성해야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const ids = Array.from(states.keys());
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('isOpen이 true여야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const state = Array.from(states.values())[0];
      expect(state.isOpen).toBe(true);
    });

    it('컴포넌트가 저장되어야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const state = Array.from(states.values())[0];
      expect(state.component).toStrictEqual(DummyComponent);
    });

    it('data를 전달할 수 있어야 함', () => {
      const testData = { title: 'Test', count: 42 };
      manager.open(DummyComponent, { data: testData }).catch(() => {});
      const states = manager.getStates();
      const state = Array.from(states.values())[0];
      expect(state.data).toEqual(testData);
    });

    it('onMounted 콜백이 저장되어야 함', () => {
      const onMounted = vi.fn();
      manager.open(DummyComponent, { onMounted }).catch(() => {});
      const states = manager.getStates();
      const state = Array.from(states.values())[0];
      expect(state.onMounted).toBe(onMounted);
    });
  });

  describe('close()', () => {
    it('overlay를 닫으면 isOpen이 false가 되어야 함', async () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      const state = states.get(id);
      expect(state?.isOpen).toBe(false);
    });

    it('Promise를 resolve해야 함', async () => {
      const promise = manager.open(DummyComponent);
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      manager.close(id, 'test-result');
      const result = await promise;

      expect(result.type).toBe('close');
      expect(result.data).toBe('test-result');
    });

    it('존재하지 않는 ID로 닫기 시도 시 아무 일도 일어나지 않아야 함', () => {
      expect(() => manager.close('non-existent-id')).not.toThrow();
    });

    it('beforeClose가 false를 반환하면 닫기가 취소되어야 함', async () => {
      const beforeClose = vi.fn(() => false);
      manager.open(DummyComponent, { beforeClose }).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      const state = states.get(id);

      expect(beforeClose).toHaveBeenCalled();
      expect(state?.isOpen).toBe(true); // 여전히 열려있어야 함
    });

    it('beforeClose가 true를 반환하면 닫혀야 함', async () => {
      const beforeClose = vi.fn(() => true);
      manager.open(DummyComponent, { beforeClose }).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      const state = states.get(id);

      expect(beforeClose).toHaveBeenCalled();
      expect(state?.isOpen).toBe(false);
    });

    it('beforeClose가 async Promise<false>를 반환하면 닫기가 취소되어야 함', async () => {
      const beforeClose = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return false;
      });
      manager.open(DummyComponent, { beforeClose }).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      const state = states.get(id);

      expect(beforeClose).toHaveBeenCalled();
      expect(state?.isOpen).toBe(true);
    });

    it('beforeClose가 async Promise<true>를 반환하면 닫혀야 함', async () => {
      const beforeClose = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      });
      manager.open(DummyComponent, { beforeClose }).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      const state = states.get(id);

      expect(beforeClose).toHaveBeenCalled();
      expect(state?.isOpen).toBe(false);
    });

    it('일정 시간 후 상태에서 제거되어야 함', async () => {
      vi.useFakeTimers();

      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      expect(states.has(id)).toBe(true);

      // 300ms 후
      await vi.advanceTimersByTimeAsync(300);
      expect(states.has(id)).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('dismiss()', () => {
    it('Promise를 reject해야 함', async () => {
      const promise = manager.open(DummyComponent);
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      manager.dismiss(id, 'cancelled');

      await expect(promise).rejects.toEqual({
        type: 'dismiss',
        reason: 'cancelled',
      });
    });

    it('isOpen이 false가 되어야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      manager.dismiss(id);
      const state = states.get(id);
      expect(state?.isOpen).toBe(false);
    });
  });

  describe('closeAll()', () => {
    it('모든 overlay를 닫아야 함', async () => {
      manager.open(DummyComponent).catch(() => {});
      manager.open(DummyComponent).catch(() => {});
      manager.open(DummyComponent).catch(() => {});

      const states = manager.getStates();
      expect(states.size).toBe(3);

      await manager.closeAll();

      Array.from(states.values()).forEach(state => {
        expect(state.isOpen).toBe(false);
      });
    });
  });

  describe('has()', () => {
    it('존재하는 overlay에 대해 true를 반환해야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      expect(manager.has(id)).toBe(true);
    });

    it('존재하지 않는 overlay에 대해 false를 반환해야 함', () => {
      expect(manager.has('non-existent-id')).toBe(false);
    });
  });

  describe('getStates()', () => {
    it('읽기 전용 Map을 반환해야 함', () => {
      const states = manager.getStates();
      expect(states).toBeInstanceOf(Map);
    });

    it('현재 모든 overlay 상태를 반환해야 함', () => {
      manager.open(DummyComponent).catch(() => {});
      manager.open(DummyComponent).catch(() => {});

      const states = manager.getStates();
      expect(states.size).toBe(2);
    });
  });
});
