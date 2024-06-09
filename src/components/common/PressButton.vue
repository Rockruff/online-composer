<script setup lang="ts">
import { setIntervalWithCancel, setTimeoutWithCancel } from '@/packages/timing';

const props = withDefaults(
  defineProps<{
    delay?: number;
    interval?: number;
  }>(),
  {
    delay: 500,
    interval: 40,
  },
);

const emit = defineEmits<{
  press: [];
}>();

const onMouse = (event: MouseEvent) => {
  const type = 'press';
  const { delay, interval } = props;

  // issue first event
  emit(type);

  // delay sometime, then trigger event periodically
  let cancel = setTimeoutWithCancel(() => {
    cancel = setIntervalWithCancel(emit, interval, type);
  }, delay);

  // delay getting the value of cancel to execution
  const stop = () => cancel();

  // cancel event trigger on mouseout or mouseup
  window.addEventListener('mouseup', stop, { once: true });
  const element = event.currentTarget! as HTMLElement;
  element.addEventListener('mouseout', stop, { once: true });
};
</script>

<template>
  <div class="text-zinc-100 bg-zinc-500 hover:bg-zinc-400" @mousedown.stop.left="onMouse">
    <slot></slot>
  </div>
</template>
