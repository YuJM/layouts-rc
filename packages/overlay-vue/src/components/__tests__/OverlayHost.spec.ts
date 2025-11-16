import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import OverlayHost from '../OverlayHost.vue';
import { OverlayManager } from '../../core/overlay-manager';

// 테스트용 더미 컴포넌트
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  props: {
    title: String,
    onClose: Function,
  },
  setup(props) {
    return () =>
      h('div', { class: 'dummy-component' }, [
        h('h1', props.title),
        h('button', { onClick: () => props.onClose?.() }, 'Close'),
      ]);
  },
});

const AnotherComponent = defineComponent({
  name: 'AnotherComponent',
  setup() {
    return () => h('div', { class: 'another-component' }, 'Another Component');
  },
});

describe('OverlayHost', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    // 각 테스트마다 새로운 매니저 인스턴스
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
  });

  describe('기본 렌더링', () => {
    it('빈 상태에서 아무것도 렌더링하지 않아야 함', () => {
      const wrapper = mount(OverlayHost);

      // 빈 template는 빈 문자열로 렌더링됨
      expect(wrapper.html()).toBe('');
    });

    it('overlay가 열리면 컴포넌트를 렌더링해야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'Test Title' },
        })
        .catch(() => {});

      await nextTick();

      expect(wrapper.find('.dummy-component').exists()).toBe(true);
      expect(wrapper.find('h1').text()).toBe('Test Title');
    });

    it('여러 overlay를 렌더링할 수 있어야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'First' },
        })
        .catch(() => {});

      manager.open(AnotherComponent).catch(() => {});

      await nextTick();

      expect(wrapper.findAll('.dummy-component')).toHaveLength(1);
      expect(wrapper.findAll('.another-component')).toHaveLength(1);
    });
  });

  describe('props 전달', () => {
    it('overlay에 props를 전달해야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'Custom Title' },
        })
        .catch(() => {});

      await nextTick();

      expect(wrapper.find('h1').text()).toBe('Custom Title');
    });

    it('props가 변경되면 업데이트되어야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'Initial Title' },
        })
        .catch(() => {});

      await nextTick();

      const states = manager.getStates();
      const state = Array.from(states.values())[0];
      state.data.title = 'Updated Title';

      await nextTick();

      expect(wrapper.find('h1').text()).toBe('Updated Title');
    });
  });

  describe('lifecycle 콜백', () => {
    it('onMounted 콜백이 호출되어야 함', async () => {
      const onMounted = vi.fn();
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          onMounted,
        })
        .catch(() => {});

      await nextTick();

      expect(onMounted).toHaveBeenCalledTimes(1);
    });

    it('onUnmounted 콜백이 호출되어야 함', async () => {
      const onUnmounted = vi.fn();
      const wrapper = mount(OverlayHost);

      const promise = manager.open(DummyComponent, {
        onUnmounted,
      });

      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      // Close and wait for promise
      await manager.close(id);
      await promise;

      // Wait for watcher to detect state change
      await nextTick();
      await nextTick();

      expect(onUnmounted).toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay 닫기', () => {
    it('닫힌 overlay는 렌더링되지 않아야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'Test' },
        })
        .catch(() => {});

      await nextTick();

      expect(wrapper.find('.dummy-component').exists()).toBe(true);

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      await manager.close(id);
      await nextTick();

      expect(wrapper.find('.dummy-component').exists()).toBe(false);
    });

    it('하나의 overlay만 닫아야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager
        .open(DummyComponent, {
          data: { title: 'First' },
        })
        .catch(() => {});

      manager.open(AnotherComponent).catch(() => {});

      await nextTick();

      expect(wrapper.findAll('.dummy-component')).toHaveLength(1);
      expect(wrapper.findAll('.another-component')).toHaveLength(1);

      const states = manager.getStates();
      const firstId = Array.from(states.keys())[0];

      await manager.close(firstId);
      await nextTick();

      expect(wrapper.findAll('.dummy-component')).toHaveLength(0);
      expect(wrapper.findAll('.another-component')).toHaveLength(1);
    });
  });

  describe('반응형 업데이트', () => {
    it('새로운 overlay가 추가되면 자동으로 렌더링해야 함', async () => {
      const wrapper = mount(OverlayHost);

      // 빈 상태 확인
      expect(wrapper.html()).toBe('');

      manager.open(DummyComponent).catch(() => {});
      await nextTick();

      expect(wrapper.find('.dummy-component').exists()).toBe(true);

      manager.open(AnotherComponent).catch(() => {});
      await nextTick();

      expect(wrapper.findAll('.dummy-component')).toHaveLength(1);
      expect(wrapper.findAll('.another-component')).toHaveLength(1);
    });

    it('overlay 상태 변경에 반응해야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager.open(DummyComponent).catch(() => {});
      await nextTick();

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];

      expect(wrapper.find('.dummy-component').exists()).toBe(true);

      await manager.close(id);
      await nextTick();

      expect(wrapper.find('.dummy-component').exists()).toBe(false);
    });
  });

  describe('컴포넌트 언마운트', () => {
    it('OverlayHost가 언마운트되어도 에러가 발생하지 않아야 함', async () => {
      const wrapper = mount(OverlayHost);

      manager.open(DummyComponent).catch(() => {});
      await nextTick();

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  describe('렌더링 순서', () => {
    it('overlay가 추가된 순서대로 렌더링해야 함', async () => {
      const wrapper = mount(OverlayHost);

      const FirstComponent = defineComponent({
        name: 'FirstComponent',
        setup() {
          return () => h('div', { class: 'first' }, 'First');
        },
      });

      const SecondComponent = defineComponent({
        name: 'SecondComponent',
        setup() {
          return () => h('div', { class: 'second' }, 'Second');
        },
      });

      manager.open(FirstComponent).catch(() => {});
      manager.open(SecondComponent).catch(() => {});

      await nextTick();

      const children = wrapper.findAll('div');
      expect(children[0].classes()).toContain('first');
      expect(children[1].classes()).toContain('second');
    });
  });
});
