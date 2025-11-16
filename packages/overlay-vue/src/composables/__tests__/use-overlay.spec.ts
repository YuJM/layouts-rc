import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useOverlay } from '../use-overlay';
import { OverlayManager } from '../../core/overlay-manager';

// 테스트용 더미 컴포넌트
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  setup() {
    return () => h('div', 'Dummy Component');
  },
});

describe('useOverlay', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    // 각 테스트마다 새로운 매니저 인스턴스
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
  });

  describe('open()', () => {
    it('OverlayManager.open()을 호출해야 함', () => {
      const openSpy = vi.spyOn(manager, 'open');
      const { openOverlay } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});

      expect(openSpy).toHaveBeenCalledWith(DummyComponent, undefined);
    });

    it('options를 전달할 수 있어야 함', () => {
      const openSpy = vi.spyOn(manager, 'open');
      const { openOverlay } = useOverlay();
      const options = { data: { title: 'Test' } };

      openOverlay(DummyComponent, options).catch(() => {});

      expect(openSpy).toHaveBeenCalledWith(DummyComponent, options);
    });

    it('Promise를 반환해야 함', () => {
      const { openOverlay } = useOverlay();
      const result = openOverlay(DummyComponent);

      expect(result).toBeInstanceOf(Promise);
      result.catch(() => {});
    });

    it('열린 overlay를 추적할 수 있어야 함', () => {
      const { openOverlay, overlays } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});

      expect(overlays.value.size).toBe(1);
    });

    it('여러 overlay를 동시에 열 수 있어야 함', () => {
      const { openOverlay, overlays } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      openOverlay(DummyComponent).catch(() => {});
      openOverlay(DummyComponent).catch(() => {});

      expect(overlays.value.size).toBe(3);
    });
  });

  describe('close()', () => {
    it('특정 overlay를 닫을 수 있어야 함', async () => {
      const closeSpy = vi.spyOn(manager, 'close');
      const { openOverlay, close } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await close(id);

      expect(closeSpy).toHaveBeenCalledWith(id, undefined);
    });

    it('결과와 함께 닫을 수 있어야 함', async () => {
      const closeSpy = vi.spyOn(manager, 'close');
      const { openOverlay, close } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await close(id, { confirmed: true });

      expect(closeSpy).toHaveBeenCalledWith(id, { confirmed: true });
    });

    it('존재하지 않는 ID로 닫기 시도 시 에러가 발생하지 않아야 함', async () => {
      const { close } = useOverlay();

      await expect(close('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('closeAll()', () => {
    it('모든 overlay를 닫아야 함', async () => {
      const closeAllSpy = vi.spyOn(manager, 'closeAll');
      const { openOverlay, closeAll } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      openOverlay(DummyComponent).catch(() => {});
      openOverlay(DummyComponent).catch(() => {});

      await closeAll();

      expect(closeAllSpy).toHaveBeenCalled();
    });

    it('닫은 후 overlays가 비어야 함', async () => {
      const { openOverlay, closeAll, overlays } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      openOverlay(DummyComponent).catch(() => {});

      await closeAll();

      // closeAll 호출 직후에는 isOpen이 false이지만 아직 삭제되지 않음
      Array.from(overlays.value.values()).forEach(state => {
        expect(state.isOpen).toBe(false);
      });
    });
  });

  describe('overlays (reactive)', () => {
    it('reactive ref여야 함', () => {
      const { overlays } = useOverlay();

      expect(overlays.value).toBeInstanceOf(Map);
    });

    it('overlay 열기/닫기에 반응해야 함', async () => {
      const { openOverlay, close, overlays } = useOverlay();

      expect(overlays.value.size).toBe(0);

      openOverlay(DummyComponent).catch(() => {});
      expect(overlays.value.size).toBe(1);

      const id = Array.from(overlays.value.keys())[0];
      await close(id);

      const state = overlays.value.get(id);
      expect(state?.isOpen).toBe(false);
    });
  });

  describe('has()', () => {
    it('존재하는 overlay에 대해 true를 반환해야 함', () => {
      const { openOverlay, has } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      expect(has(id)).toBe(true);
    });

    it('존재하지 않는 overlay에 대해 false를 반환해야 함', () => {
      const { has } = useOverlay();

      expect(has('non-existent-id')).toBe(false);
    });
  });

  describe('getOverlay()', () => {
    it('특정 overlay 상태를 반환해야 함', () => {
      const { openOverlay, getOverlay } = useOverlay();

      openOverlay(DummyComponent).catch(() => {});
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      const state = getOverlay(id);

      expect(state).toBeDefined();
      expect(state?.id).toBe(id);
      expect(state?.isOpen).toBe(true);
    });

    it('존재하지 않는 ID에 대해 undefined를 반환해야 함', () => {
      const { getOverlay } = useOverlay();

      expect(getOverlay('non-existent-id')).toBeUndefined();
    });
  });

  describe('여러 인스턴스', () => {
    it('동일한 manager를 공유해야 함', () => {
      const overlay1 = useOverlay();
      const overlay2 = useOverlay();

      overlay1.openOverlay(DummyComponent).catch(() => {});

      // 두 인스턴스가 같은 상태를 공유
      expect(overlay1.overlays.value.size).toBe(1);
      expect(overlay2.overlays.value.size).toBe(1);
    });
  });
});
