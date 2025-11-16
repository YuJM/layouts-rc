import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import OverlayHost from '../../components/OverlayHost.vue';
import { useCurrentOverlay } from '../use-current-overlay';
import { useOverlay } from '../use-overlay';
import { OverlayManager } from '../../core/overlay-manager';

describe('useCurrentOverlay', () => {
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

  describe('Context Access', () => {
    it('should provide context to overlay components', async () => {
      let contextId: string | undefined;
      let contextData: any;

      const TestComponent = defineComponent({
        name: 'TestComponent',
        setup() {
          const overlay = useCurrentOverlay();
          contextId = overlay.id;
          contextData = overlay.data;

          return () => h('div', `ID: ${overlay.id}`);
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay(TestComponent, {
        data: { title: 'Test Title' },
      });

      await nextTick();

      expect(contextId).toBeDefined();
      expect(contextData).toEqual({ title: 'Test Title' });

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];
      await manager.close(id);

      await promise.catch(() => {});
    });

    it('should throw error when used outside overlay', () => {
      const InvalidComponent = defineComponent({
        name: 'InvalidComponent',
        setup() {
          // Overlay 외부에서 사용 시 에러
          expect(() => useCurrentOverlay()).toThrow(
            '[overlay-vue] useCurrentOverlay must be called within an overlay component',
          );
          return () => h('div', 'Invalid');
        },
      });

      mount(InvalidComponent);
    });
  });

  describe('Self-Closing', () => {
    it('should allow overlay to close itself', async () => {
      const SelfClosingComponent = defineComponent({
        name: 'SelfClosingComponent',
        setup() {
          const overlay = useCurrentOverlay();

          return () =>
            h(
              'button',
              { onClick: () => overlay.close({ success: true }) },
              'Close',
            );
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay(SelfClosingComponent);

      await nextTick();

      // 버튼 클릭으로 self-close
      await wrapper.find('button').trigger('click');
      await nextTick();

      const result = await promise;
      expect(result.type).toBe('close');
      expect(result.data).toEqual({ success: true });
    });

    it('should allow overlay to dismiss itself', async () => {
      const SelfDismissingComponent = defineComponent({
        name: 'SelfDismissingComponent',
        setup() {
          const overlay = useCurrentOverlay();

          return () =>
            h(
              'button',
              { onClick: () => overlay.dismiss('cancelled') },
              'Dismiss',
            );
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay(SelfDismissingComponent);

      await nextTick();

      // 버튼 클릭으로 self-dismiss
      await wrapper.find('button').trigger('click');
      await nextTick();

      await expect(promise).rejects.toEqual({
        type: 'dismiss',
        reason: 'cancelled',
      });
    });
  });

  describe('Type Safety', () => {
    it('should provide type-safe data access', async () => {
      interface FormData {
        title: string;
        message: string;
      }

      interface FormResult {
        confirmed: boolean;
        input: string;
      }

      const TypedComponent = defineComponent({
        name: 'TypedComponent',
        setup() {
          const overlay = useCurrentOverlay<FormData, FormResult>();

          // TypeScript가 타입을 추론함
          const title: string = overlay.data.title;
          const message: string = overlay.data.message;

          return () =>
            h('div', [
              h('h2', title),
              h('p', message),
              h(
                'button',
                {
                  onClick: () =>
                    overlay.close({ confirmed: true, input: 'test' }),
                },
                'Confirm',
              ),
            ]);
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay<FormData, FormResult>(TypedComponent, {
        data: {
          title: 'Form Title',
          message: 'Form Message',
        },
      });

      await nextTick();

      expect(wrapper.find('h2').text()).toBe('Form Title');
      expect(wrapper.find('p').text()).toBe('Form Message');

      await wrapper.find('button').trigger('click');
      await nextTick();

      const result = await promise;
      expect(result.data).toEqual({ confirmed: true, input: 'test' });
    });
  });

  describe('Multiple Overlays', () => {
    it('should provide correct context to each overlay', async () => {
      const contexts: Array<{ id: string; data: any }> = [];

      const MultiComponent = defineComponent({
        name: 'MultiComponent',
        setup() {
          const overlay = useCurrentOverlay();
          contexts.push({ id: overlay.id, data: overlay.data });

          return () =>
            h(
              'div',
              { class: `overlay-${overlay.data.index}` },
              overlay.data.title,
            );
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promises = [
        openOverlay(MultiComponent, { data: { index: 1, title: 'First' } }),
        openOverlay(MultiComponent, { data: { index: 2, title: 'Second' } }),
        openOverlay(MultiComponent, { data: { index: 3, title: 'Third' } }),
      ];

      await nextTick();

      // 각 overlay가 고유한 ID와 데이터를 가짐
      expect(contexts).toHaveLength(3);
      expect(new Set(contexts.map(c => c.id)).size).toBe(3);
      expect(contexts[0].data).toEqual({ index: 1, title: 'First' });
      expect(contexts[1].data).toEqual({ index: 2, title: 'Second' });
      expect(contexts[2].data).toEqual({ index: 3, title: 'Third' });

      // 렌더링 확인
      expect(wrapper.find('.overlay-1').text()).toBe('First');
      expect(wrapper.find('.overlay-2').text()).toBe('Second');
      expect(wrapper.find('.overlay-3').text()).toBe('Third');

      const states = manager.getStates();
      await Promise.all(Array.from(states.keys()).map(id => manager.close(id)));

      await Promise.allSettled(promises);
    });

    it('should maintain correct context when overlays are closed', async () => {
      const closedIds: string[] = [];

      const TrackingComponent = defineComponent({
        name: 'TrackingComponent',
        setup() {
          const overlay = useCurrentOverlay();

          return () =>
            h(
              'button',
              {
                class: `btn-${overlay.data.index}`,
                onClick: () => {
                  closedIds.push(overlay.id);
                  overlay.close();
                },
              },
              `Close ${overlay.data.index}`,
            );
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promises = [
        openOverlay(TrackingComponent, { data: { index: 1 } }),
        openOverlay(TrackingComponent, { data: { index: 2 } }),
        openOverlay(TrackingComponent, { data: { index: 3 } }),
      ];

      await nextTick();

      // 중간 overlay 닫기
      await wrapper.find('.btn-2').trigger('click');
      await nextTick();

      expect(closedIds).toHaveLength(1);

      // 첫 번째 overlay 닫기
      await wrapper.find('.btn-1').trigger('click');
      await nextTick();

      expect(closedIds).toHaveLength(2);

      // 각 overlay가 올바른 ID로 닫혔는지 확인
      expect(new Set(closedIds).size).toBe(2);

      const states = manager.getStates();
      await Promise.all(Array.from(states.keys()).map(id => manager.close(id)));

      await Promise.allSettled(promises);
    });
  });

  describe('Integration with Data', () => {
    it('should access data through context.data', async () => {
      interface DialogData {
        title: string;
        description: string;
        confirmText?: string;
      }

      const DialogComponent = defineComponent({
        name: 'DialogComponent',
        setup() {
          const overlay = useCurrentOverlay<DialogData>();

          return () =>
            h('div', { class: 'dialog' }, [
              h('h2', overlay.data.title),
              h('p', overlay.data.description),
              h(
                'button',
                { onClick: () => overlay.close() },
                overlay.data.confirmText || 'OK',
              ),
            ]);
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay<DialogData>(DialogComponent, {
        data: {
          title: 'Confirm Action',
          description: 'Are you sure?',
          confirmText: 'Yes, Continue',
        },
      });

      await nextTick();

      expect(wrapper.find('.dialog h2').text()).toBe('Confirm Action');
      expect(wrapper.find('.dialog p').text()).toBe('Are you sure?');
      expect(wrapper.find('.dialog button').text()).toBe('Yes, Continue');

      await wrapper.find('.dialog button').trigger('click');
      await promise.catch(() => {});
    });

    it('should handle undefined optional data fields', async () => {
      interface OptionalData {
        required: string;
        optional?: string;
      }

      const OptionalComponent = defineComponent({
        name: 'OptionalComponent',
        setup() {
          const overlay = useCurrentOverlay<OptionalData>();

          return () =>
            h('div', [
              h('p', overlay.data.required),
              overlay.data.optional && h('p', overlay.data.optional),
            ]);
        },
      });

      const wrapper = mount(OverlayHost);
      const { openOverlay } = useOverlay();

      const promise = openOverlay<OptionalData>(OptionalComponent, {
        data: {
          required: 'Required Value',
        },
      });

      await nextTick();

      const paragraphs = wrapper.findAll('p');
      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].text()).toBe('Required Value');

      const states = manager.getStates();
      const id = Array.from(states.keys())[0];
      await manager.close(id);

      await promise.catch(() => {});
    });
  });
});
