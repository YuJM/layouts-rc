import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import OverlayHost from '../../components/OverlayHost.vue';
import { useOverlay } from '../../composables/use-overlay';
import { useOverlayController } from '../../composables/use-overlay-controller';
import { OverlayManager } from '../../core/overlay-manager';

/**
 * Real Component Integration Tests
 *
 * 실제 Vue 컴포넌트를 사용한 통합 테스트
 * - Dialog, Sheet, Modal 등 실제 UI 컴포넌트와의 통합
 * - 복잡한 props 전달 및 이벤트 처리
 * - 여러 타입의 overlay 동시 관리
 */

// 실제 Dialog 컴포넌트 (Radix Vue 스타일)
const DialogComponent = defineComponent({
  name: 'DialogComponent',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    onConfirm: {
      type: Function,
      default: undefined,
    },
    onCancel: {
      type: Function,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true' }, [
        h('div', { class: 'dialog-content' }, [
          h('h2', { class: 'dialog-title' }, props.title),
          props.description &&
            h('p', { class: 'dialog-description' }, props.description),
          h('div', { class: 'dialog-actions' }, [
            h(
              'button',
              {
                class: 'dialog-cancel',
                onClick: () => props.onCancel?.(),
              },
              'Cancel',
            ),
            h(
              'button',
              {
                class: 'dialog-confirm',
                onClick: () => props.onConfirm?.(),
              },
              'Confirm',
            ),
          ]),
        ]),
      ]);
  },
});

// Sheet 컴포넌트 (측면 슬라이드)
const SheetComponent = defineComponent({
  name: 'SheetComponent',
  props: {
    side: {
      type: String as () => 'left' | 'right' | 'top' | 'bottom',
      default: 'right',
    },
    title: String,
    onClose: Function,
  },
  setup(props) {
    return () =>
      h('div', { class: `sheet sheet-${props.side}`, role: 'dialog' }, [
        h('div', { class: 'sheet-content' }, [
          props.title && h('h3', { class: 'sheet-title' }, props.title),
          h(
            'button',
            { class: 'sheet-close', onClick: () => props.onClose?.() },
            'Close',
          ),
          h('div', { class: 'sheet-body' }, 'Sheet Content'),
        ]),
      ]);
  },
});

// Modal 컴포넌트 (전체화면)
const ModalComponent = defineComponent({
  name: 'ModalComponent',
  props: {
    content: String,
    onDismiss: Function,
  },
  setup(props) {
    return () =>
      h('div', { class: 'modal', role: 'dialog' }, [
        h('div', {
          class: 'modal-overlay',
          onClick: () => props.onDismiss?.(),
        }),
        h('div', { class: 'modal-content' }, [
          h('p', props.content),
          h(
            'button',
            { class: 'modal-close', onClick: () => props.onDismiss?.() },
            'Close',
          ),
        ]),
      ]);
  },
});

describe('Real Component Integration', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    manager = new (OverlayManager as any)();
    vi.spyOn(OverlayManager, 'getInstance').mockReturnValue(manager);
  });

  afterEach(async () => {
    // 모든 overlay 정리
    const states = manager.getStates();
    await Promise.allSettled(
      Array.from(states.keys()).map(id => manager.close(id)),
    );
  });

  describe('Dialog Component Integration', () => {
    it('should open and close Dialog with real component', async () => {
      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const promise = openOverlay(DialogComponent, {
        data: {
          title: 'Delete Confirmation',
          description: 'Are you sure you want to delete this item?',
          onConfirm,
          onCancel,
        },
      });

      await nextTick();

      // Dialog 렌더링 확인
      expect(wrapper.find('.dialog').exists()).toBe(true);
      expect(wrapper.find('.dialog-title').text()).toBe('Delete Confirmation');
      expect(wrapper.find('.dialog-description').text()).toBe(
        'Are you sure you want to delete this item?',
      );

      // Confirm 버튼 클릭
      await wrapper.find('.dialog-confirm').trigger('click');
      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Close overlay
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];
      await manager.close(id, true);

      await nextTick();

      expect(wrapper.find('.dialog').exists()).toBe(false);

      // Promise 처리
      await promise.catch(() => {});
    });

    it('should handle Dialog cancel action', async () => {
      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const onCancel = vi.fn();

      const promise = openOverlay(DialogComponent, {
        data: {
          title: 'Confirm Action',
          onCancel,
        },
      });

      await nextTick();

      // Cancel 버튼 클릭
      await wrapper.find('.dialog-cancel').trigger('click');
      expect(onCancel).toHaveBeenCalledTimes(1);

      // Dismiss overlay
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];
      manager.dismiss(id);

      await nextTick();

      expect(wrapper.find('.dialog').exists()).toBe(false);

      // Promise rejection 처리
      await promise.catch(() => {});
    });
  });

  describe('Multiple Overlay Types', () => {
    it('should manage Dialog and Sheet simultaneously', async () => {
      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const dialogPromise = openOverlay(DialogComponent, {
        data: { title: 'Dialog Title' },
      });

      const sheetPromise = openOverlay(SheetComponent, {
        data: { title: 'Sheet Title', side: 'right' },
      });

      await nextTick();

      // 두 overlay 모두 렌더링
      expect(wrapper.find('.dialog').exists()).toBe(true);
      expect(wrapper.find('.sheet').exists()).toBe(true);
      expect(wrapper.find('.dialog-title').text()).toBe('Dialog Title');
      expect(wrapper.find('.sheet-title').text()).toBe('Sheet Title');

      // Sheet 닫기
      const states = manager.getStates();
      const ids = Array.from(states.keys());
      await manager.close(ids[1]);

      await nextTick();

      expect(wrapper.find('.dialog').exists()).toBe(true);
      expect(wrapper.find('.sheet').exists()).toBe(false);

      // Dialog 닫기
      await manager.close(ids[0]);

      await nextTick();

      expect(wrapper.find('.dialog').exists()).toBe(false);

      // Promise 처리
      await Promise.allSettled([dialogPromise, sheetPromise]);
    });

    it('should handle complex overlay composition', async () => {
      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      // Modal → Dialog → Sheet 순서로 열기
      const modalPromise = openOverlay(ModalComponent, {
        data: { content: 'Modal Content' },
      });

      await nextTick();

      const dialogPromise = openOverlay(DialogComponent, {
        data: { title: 'Dialog on Modal' },
      });

      await nextTick();

      const sheetPromise = openOverlay(SheetComponent, {
        data: { title: 'Sheet on Dialog' },
      });

      await nextTick();

      // 모든 overlay 렌더링 확인
      expect(wrapper.findAll('.modal')).toHaveLength(1);
      expect(wrapper.findAll('.dialog')).toHaveLength(1);
      expect(wrapper.findAll('.sheet')).toHaveLength(1);

      // 역순으로 닫기 (Sheet → Dialog → Modal)
      const states = manager.getStates();
      const ids = Array.from(states.keys());

      await manager.close(ids[2]); // Sheet
      await nextTick();
      expect(wrapper.find('.sheet').exists()).toBe(false);

      await manager.close(ids[1]); // Dialog
      await nextTick();
      expect(wrapper.find('.dialog').exists()).toBe(false);

      await manager.close(ids[0]); // Modal
      await nextTick();
      expect(wrapper.find('.modal').exists()).toBe(false);

      // Promise 처리
      await Promise.allSettled([modalPromise, dialogPromise, sheetPromise]);
    });
  });

  describe('Stacked Overlays', () => {
    it('should handle multiple Dialog stacking correctly', async () => {
      const wrapper = mount(OverlayHost);

      // 3개의 Dialog를 차례로 열기
      const controller1 = useOverlayController(DialogComponent, {
        data: { title: 'First Dialog' },
      });

      await nextTick();

      const controller2 = useOverlayController(DialogComponent, {
        data: { title: 'Second Dialog' },
      });

      await nextTick();

      const controller3 = useOverlayController(DialogComponent, {
        data: { title: 'Third Dialog' },
      });

      await nextTick();

      // 3개 모두 렌더링
      const dialogs = wrapper.findAll('.dialog');
      expect(dialogs).toHaveLength(3);

      const titles = wrapper.findAll('.dialog-title');
      expect(titles[0].text()).toBe('First Dialog');
      expect(titles[1].text()).toBe('Second Dialog');
      expect(titles[2].text()).toBe('Third Dialog');

      // 중간 Dialog 닫기
      await controller2.close();
      await nextTick();

      const remaining = wrapper.findAll('.dialog');
      expect(remaining).toHaveLength(2);
      expect(remaining[0].find('.dialog-title').text()).toBe('First Dialog');
      expect(remaining[1].find('.dialog-title').text()).toBe('Third Dialog');

      // 나머지 닫기
      await controller1.close();
      await controller3.close();
      await nextTick();

      expect(wrapper.findAll('.dialog')).toHaveLength(0);

      // Promise 처리
      await Promise.allSettled([
        controller1.result,
        controller2.result,
        controller3.result,
      ]);
    });

    it('should maintain correct stacking order', async () => {
      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promises = [];

      // 5개의 overlay를 빠르게 연속으로 열기
      for (let i = 1; i <= 5; i++) {
        promises.push(
          openOverlay(DialogComponent, {
            data: { title: `Dialog ${i}` },
          }),
        );
      }

      await nextTick();

      // 순서대로 렌더링되었는지 확인
      const titles = wrapper.findAll('.dialog-title');
      expect(titles).toHaveLength(5);
      titles.forEach((title, index) => {
        expect(title.text()).toBe(`Dialog ${index + 1}`);
      });

      // 모두 닫기
      const states = manager.getStates();
      await Promise.all(Array.from(states.keys()).map(id => manager.close(id)));

      await nextTick();

      expect(wrapper.findAll('.dialog')).toHaveLength(0);

      // Promise 처리
      await Promise.allSettled(promises);
    });
  });

  describe('Complex Props and Events', () => {
    it('should handle complex nested data props', async () => {
      interface UserData {
        id: number;
        name: string;
        email: string;
        profile: {
          avatar: string;
          bio: string;
        };
      }

      const UserDialogComponent = defineComponent({
        name: 'UserDialog',
        props: {
          user: {
            type: Object as () => UserData,
            required: true,
          },
          onSave: Function,
        },
        setup(props) {
          return () =>
            h('div', { class: 'user-dialog' }, [
              h('h2', props.user.name),
              h('p', props.user.email),
              h('img', { src: props.user.profile.avatar }),
              h('p', props.user.profile.bio),
              h(
                'button',
                { onClick: () => props.onSave?.(props.user) },
                'Save',
              ),
            ]);
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const userData: UserData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
          avatar: '/avatar.jpg',
          bio: 'Software Engineer',
        },
      };

      const onSave = vi.fn();

      const promise = openOverlay(UserDialogComponent, {
        data: {
          user: userData,
          onSave,
        },
      });

      await nextTick();

      // Complex props 렌더링 확인
      expect(wrapper.find('.user-dialog h2').text()).toBe('John Doe');
      expect(wrapper.find('.user-dialog p').text()).toBe('john@example.com');
      expect(wrapper.find('.user-dialog img').attributes('src')).toBe(
        '/avatar.jpg',
      );

      // Event handler 호출
      await wrapper.find('.user-dialog button').trigger('click');
      expect(onSave).toHaveBeenCalledWith(userData);

      // Close
      const states = manager.getStates();
      const id = Array.from(states.keys())[0];
      await manager.close(id);

      await promise.catch(() => {});
    });

    it('should handle reactive props updates', async () => {
      const CounterComponent = defineComponent({
        name: 'CounterComponent',
        props: {
          count: {
            type: Number,
            required: true,
          },
          onIncrement: Function,
        },
        setup(props) {
          return () =>
            h('div', { class: 'counter' }, [
              h('span', { class: 'count' }, String(props.count)),
              h(
                'button',
                { onClick: () => props.onIncrement?.() },
                'Increment',
              ),
            ]);
        },
      });

      const wrapper = mount(OverlayHost);

      const count = ref(0);
      const onIncrement = vi.fn(() => {
        count.value++;
      });

      const controller = useOverlayController(CounterComponent, {
        data: {
          count: count.value,
          onIncrement,
        },
      });

      await nextTick();

      expect(wrapper.find('.count').text()).toBe('0');

      // Increment 버튼 클릭
      await wrapper.find('.counter button').trigger('click');
      expect(onIncrement).toHaveBeenCalledTimes(1);
      expect(count.value).toBe(1);

      // Props 업데이트
      const states = manager.getStates();
      const state = states.get(controller.id);
      if (state) {
        state.data.count = count.value;
      }

      await nextTick();

      expect(wrapper.find('.count').text()).toBe('1');

      await controller.close();
      await controller.result.catch(() => {});
    });
  });
});
