<script setup lang="ts">
import { tracks, transportTick } from '@/states/midi-tracks';

import { getTimeSignatures, setTimeSignature, unsetTimeSignature } from '../states/signature-track';
import { computed, shallowRef } from 'vue';
import { pixelsPerTick, pixelsPerWhole } from '@/states/piano-roll';

import TempInput from '@/components/common/TempInput.vue';

import screenSize from '@/states/screen-size';
import { ticksPerWhole } from '@/states/constants';
import { quantitize } from '@/states/state';

const totalTicks = computed(() => {
  let tick = screenSize.width / pixelsPerTick.min;

  for (const track of tracks) {
    for (const note of track.notes) {
      tick = Math.max(tick, note.start + note.length + ticksPerWhole * 8);
    }
  }

  return tick;
});

// length of the time meter

const timeMeterBars = computed(() => {
  const signatures = getTimeSignatures();
  const count = signatures.length;

  const bars = [];
  let bar = 0;
  let tick = 0;

  let index = 0;
  let curr = signatures[index];

  while (++index < count) {
    const next = signatures[index];
    for (const end = next.bar; bar < end; ) {
      bars.push({ bar, tick, sig: curr });
      tick += curr.tpb;
      bar += 1;
    }
    curr = next;
  }

  let end = totalTicks.value;

  for (; tick <= end; ) {
    bars.push({ bar, tick, sig: curr });
    tick += curr.tpb;
    bar += 1;
  }

  return bars;
});

const totalVisibleTicks = computed(() => {
  const { value } = timeMeterBars;
  const { length } = value;
  const bar = value[length - 1];
  return bar.tick + bar.sig.tpb;
});

const foldLevel = computed(() => {
  let value = pixelsPerWhole.value;
  if (value >= 64) return 1;
  if (value >= 32) return 2;
  if (value >= 16) return 4;
  if (value >= 8) return 8;
  return 16;
});

const visibleTimeMeterBars = computed(() => {
  let { value } = foldLevel;

  let includeBar = (item) => {
    return item.bar % value === 0;
  };

  return timeMeterBars.value.filter(includeBar);
});

const handleTimeSignatureChange = (text: string, bar: number) => {
  if (text === '') {
    unsetTimeSignature(bar);
    return;
  }

  let res = text.split('/');
  if (res.length !== 2) return;

  let [up, down] = res;
  let numerator = parseInt(up);
  let denominator = parseInt(down);
  setTimeSignature(bar, numerator, denominator);
};

const getRelativeClickPosition = (e: MouseEvent) => {
  let element = e.currentTarget! as HTMLElement;
  let rect = element.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  return [x, y];
};

const doQuantitize = (tick: number) => {
  tick = tick | 0;
  let q = quantitize.value | 0;
  let r = (tick / q) | 0;
  return (r * q) | 0;
};

const setTransportLocationFromMouse = (e: MouseEvent) => {
  let [x, y] = getRelativeClickPosition(e);
  transportTick.value = doQuantitize(x / pixelsPerTick.value);
};

const previewTick = shallowRef(0);

const setPreviewLocationFromMouse = (e: MouseEvent) => {
  let [x, y] = getRelativeClickPosition(e);
  previewTick.value = doQuantitize(x / pixelsPerTick.value);
};
</script>

<template>
  <div
    :style="{ width: totalVisibleTicks * pixelsPerTick.value + 'px' }"
    @mousemove.passive="setPreviewLocationFromMouse"
    @mouseout="previewTick = -1"
    class="pointer-events-auto"
  >
    <div class="absolute size-full" @click.stop="setTransportLocationFromMouse">
      <div
        v-for="({ bar, tick, sig }, index) of visibleTimeMeterBars"
        :key="index"
        class="absolute top-0 bottom-0"
        :style="{ left: pixelsPerTick.value * tick + 'px' }"
      >
        <!-- Bar Number -->
        <div class="absolute left-0 top-0 h-4 text-3/4 text-zinc-400" v-text="bar"></div>

        <!-- Bar Line -->
        <div class="absolute left-0 top-4 bottom-0 border-l border-zinc-500"></div>

        <!-- Beat lines -->
        <div
          v-if="foldLevel === 1"
          class="absolute left-0 top-6 bottom-0 flex flex-row justify-evenly"
          :style="{ width: pixelsPerTick.value * sig.tpb + 'px' }"
        >
          <div v-for="c in sig.cpb - 1" :key="c" class="flex-none border-l border-zinc-600"></div>
        </div>

        <!-- Time Signature -->
        <TempInput
          class="absolute left-px top-4 px-0.5 text-3/4 pointer-events-auto"
          :class="{ 'opacity-0 hover:opacity-50 focus:opacity-100': bar !== sig.bar }"
          :value="sig.cpb + '/' + sig.cpw"
          @commit="handleTimeSignatureChange($event, bar)"
        />
      </div>
    </div>
    <div
      v-if="previewTick >= 0"
      class="absolute top-6 bottom-0 border-l border-zinc-400 pointer-events-none"
      :style="{ left: pixelsPerTick.value * previewTick + 'px' }"
    ></div>
    <div
      class="absolute top-0 bottom-0 border-l pointer-events-none"
      :style="{ left: pixelsPerTick.value * transportTick + 'px' }"
    ></div>
    <slot></slot>
  </div>
</template>
