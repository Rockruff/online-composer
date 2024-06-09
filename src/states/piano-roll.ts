import { computed, shallowReactive } from 'vue';
import { totalKeys } from '@/states/constants';
import { ticksPerWhole } from '@/states/constants';

function increment(this: { value: number; max: number; min: number; step: number }) {
  const { max, step } = this;
  let { value } = this;
  value += step;
  if (!(value < max)) value = max;
  this.value = value;
}

function decrement(this: { value: number; max: number; min: number; step: number }) {
  const { min, step } = this;
  let { value } = this;
  value -= step;
  if (!(value > min)) value = min;
  this.value = value;
}

export const pixelsPerKey = shallowReactive({
  value: 8,
  max: 16,
  min: 4,
  step: 1,
  increment,
  decrement,
});

export const pixelsPerWhole = shallowReactive({
  value: 160,
  max: 480,
  min: 16,
  step: 4,
  increment,
  decrement,
});

export const pixelsPerTick = {
  get value() {
    return pixelsPerWhole.value / ticksPerWhole;
  },
  get max() {
    return pixelsPerWhole.max / ticksPerWhole;
  },
  get min() {
    return pixelsPerWhole.min / ticksPerWhole;
  },
  get step() {
    return pixelsPerWhole.step / ticksPerWhole;
  },
  increment() {
    pixelsPerWhole.increment();
  },
  decrement() {
    pixelsPerWhole.decrement();
  },
};

export const scrollHeightCSS = computed(() => {
  const value = pixelsPerKey.value;
  const height = totalKeys * value;
  const fontSize = value;
  return {
    height: height + 'px',
    fontSize: fontSize + 'px',
  };
});
