<script setup lang="ts">
import { shallowReactive, shallowRef, onMounted, onBeforeUnmount } from 'vue';
import { initCustomMouseEvent, uninitCustomMouseEvent } from '@/packages/mouseevent';

// usage: <ScrollBar v-if="ref1 && ref2 && ..." :targets="[ref1, ref2, ...]" :horizontal="true" />
// although being properties, these values are not supposed to change
// so they are extracted and lost their reactivity here
// this reduces branching and boosts performance
const { targets, horizontal } = defineProps<{
  targets: HTMLElement[];
  horizontal?: boolean;
}>();

// first target is used as the reference element
const target = targets[0];

// scroll information of target element
const state = shallowReactive({
  offset: 0,
  viewport: 0,
  total: 0,
});

const updateScrollSize = horizontal
  ? () => {
      state.offset = target.scrollLeft;
      state.viewport = target.clientWidth;
      state.total = target.scrollWidth;
    }
  : () => {
      state.offset = target.scrollTop;
      state.viewport = target.clientHeight;
      state.total = target.scrollHeight;
    };

// init state
onMounted(updateScrollSize);

// use resize observer to update state
const observer = new ResizeObserver(updateScrollSize);

onMounted(() => {
  // observe container to update client size when container size changed
  observer.observe(target);
  // observe children to update scroll size when child size changed
  for (let child of target.children) observer.observe(child);
});

onBeforeUnmount(() => {
  // destroy observer before unmount
  observer.disconnect();
});

// style of scrollbar thumb
// not using computed() here, because each time `offset` is updated,
// the value will be recalculated, so computed() will not help here
const thumbStyle = horizontal
  ? () => {
      let { offset, viewport, total } = state;
      if (!(viewport < total)) return;
      total /= 100;
      let left = offset / total + '%';
      let width = viewport / total + '%';
      return { left, width };
    }
  : () => {
      let { offset, viewport, total } = state;
      if (!(viewport < total)) return;
      total /= 100;
      let top = offset / total + '%';
      let height = viewport / total + '%';
      return { top, height };
    };

const scrollTo = horizontal
  ? (left: number) => {
      const option: ScrollToOptions = { behavior: 'instant', left };
      for (let target of targets) {
        target.scrollTo(option);
      }
      state.offset = target.scrollLeft;
    }
  : (top: number) => {
      const option: ScrollToOptions = { behavior: 'instant', top };
      for (let target of targets) {
        target.scrollTo(option);
      }
      state.offset = target.scrollTop;
    };

// allow direct call to scrollTo
defineExpose({ scrollTo });

// wheel handler
const onWheel = horizontal
  ? (e: WheelEvent) => {
      let left = state.offset + e.deltaY;
      scrollTo(left);
    }
  : (e: WheelEvent) => {
      let top = state.offset + e.deltaY;
      scrollTo(top);
    };

// if is vertical scroll, also add wheel handler for targets
// so wheel events in target can also be translated to scroll operations
if (!horizontal) {
  onMounted(() => {
    for (let target of targets) {
      target.addEventListener('wheel', onWheel);
    }
  });
  onBeforeUnmount(() => {
    for (let target of targets) {
      target.removeEventListener('wheel', onWheel);
    }
  });
}

// root element of component
const root = shallowRef<HTMLElement>();

onMounted(() => {
  const element = root.value!;

  const onMouse = horizontal
    ? (e: MouseEvent) => {
        let rect = element.getBoundingClientRect();
        let percent = (e.clientX - rect.x) / rect.width;
        let left = percent * state.total - 0.5 * state.viewport;
        scrollTo(left);
      }
    : (e: MouseEvent) => {
        let rect = element.getBoundingClientRect();
        let percent = (e.clientY - rect.y) / rect.height;
        let top = percent * state.total - 0.5 * state.viewport;
        scrollTo(top);
      };

  // use focus() and blur() with tabindex="-1"
  // to enable background color change when the scroll thumb is being dragged
  initCustomMouseEvent(
    element,
    {
      down: () => element.focus(),
      move: onMouse,
      up: () => element.blur(),
    },
    true,
  );
});

onBeforeUnmount(() => {
  const element = root.value!;
  uninitCustomMouseEvent(element);
});
</script>

<template>
  <div ref="root" class="relative size-full group outline-none" @wheel="onWheel" tabindex="-1">
    <div
      class="absolute size-full bg-zinc-500 group-hover:bg-zinc-400 group-focus-within:bg-zinc-400"
      :style="thumbStyle()"
    ></div>
  </div>
</template>
