<script setup lang="ts">
import { computed, ref } from 'vue';

import { pixelsPerKey, pixelsPerTick, scrollHeightCSS } from '@/states/piano-roll';

const props = defineProps(['track']);

const x = ref<HTMLElement>();
const y1 = ref<HTMLElement>();
const y2 = ref<HTMLElement>();

const initScrollPosition = (e) => {
  let el = e.el as HTMLElement;

  const container = y1.value as HTMLElement;
  const total = container.scrollHeight;
  const viewport = container.clientHeight;

  // reset to top
  let evt = new WheelEvent('wheel', { deltaY: -total });
  el.dispatchEvent(evt);

  // scroll to middle
  evt = new WheelEvent('wheel', { deltaY: (total - viewport) / 2 });
  el.dispatchEvent(evt);

  // TODO: use track data to determine which key to center
  // let key = 64;
  // ((127 - key) / totalKeys) * total - 0.5 * viewport;
};
</script>

<template>
  <div
    class="relative"
    tabindex="-1"
    @keydown="
      if ($event.code === 'KeyG') pixelsPerTick.decrement();
      else if ($event.code === 'KeyH') pixelsPerTick.increment();
    "
  >
    <div class="absolute left-0 right-0 top-0 bottom-2.5 flex flex-col gap-0.5">
      <div class="flex-none h-8"></div>
      <div class="flex-1 overflow-hidden" ref="y1">
        <div class="flex flex-row gap-1" :style="scrollHeightCSS">
          <KeyBoard class="flex-none w-20" :instrument="props.track && props.track.instrument" />
          <KeyGrid class="flex-1" />
        </div>
      </div>
      <div class="flex-none h-28 w-20">
        <select class="block w-full p-0.5">
          <option value="velocity">Velocity</option>
          <option disabled>(Need to implement more MIDI Controllers here)</option>
        </select>
      </div>
    </div>

    <div class="absolute left-21 right-0 top-0 bottom-2.5 overflow-hidden" ref="x">
      <TimeMeter class="relative size-full flex flex-col gap-0.5">
        <!-- Time Meter -->
        <div class="flex-none h-8"></div>
        <!-- Note Editor -->
        <div class="flex-1 overflow-hidden" ref="y2">
          <Notes :style="scrollHeightCSS" :key="props.track" :track="props.track" />
        </div>
        <!-- Controller Editor -->
        <Velocity class="flex-none h-28" :key="props.track" :track="props.track" />
      </TimeMeter>
    </div>

    <!-- Spacing -->
    <div class="absolute top-8 left-21 right-0 h-0.5 bg-zinc-400"></div>

    <!-- Spacing -->
    <div class="absolute bottom-30.5 left-21 right-0 h-0.5 bg-zinc-400"></div>

    <!-- X Scroll Bar -->
    <div class="absolute left-21 right-0 bottom-0 h-2 flex flex-row gap-1">
      <ScrollBar class="flex-1" v-if="x" :targets="[x]" :horizontal="true" />
      <PressButton class="flex-none" @press="pixelsPerTick.decrement()">
        <MaterialIcon class="text-2 block" type="remove" />
      </PressButton>
      <PressButton class="flex-none" @press="pixelsPerTick.increment()">
        <MaterialIcon class="text-2 block" type="add" />
      </PressButton>
    </div>

    <!-- Y Scroll Bar -->
    <div class="absolute top-9 right-0 bottom-31.5 w-2 flex flex-col gap-1">
      <ScrollBar
        class="flex-1"
        v-if="y1 && y2"
        :targets="[y1, y2]"
        @vue:mounted="initScrollPosition"
      />
      <PressButton class="flex-none" @press="pixelsPerKey.decrement()">
        <MaterialIcon class="text-2 block" type="remove" />
      </PressButton>
      <PressButton class="flex-none" @press="pixelsPerKey.increment()">
        <MaterialIcon class="text-2 block" type="add" />
      </PressButton>
    </div>
  </div>
</template>

<script lang="ts">
import TimeMeter from '@/views/TimeMeter.vue';
import KeyBoard from '@/components/KeyBoard.vue';
import KeyGrid from '@/components/KeyGrid.vue';
import Notes from '@/views/Notes.vue';
import Velocity from '@/views/Velocity.vue';
import ScrollBar from '@/components/common/ScrollBar.vue';
import MaterialIcon from '@/components/common/MaterialIcon.vue';
import PressButton from '@/components/common/PressButton.vue';
</script>
