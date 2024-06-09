<script setup lang="ts">
import { tracks } from '@/states/midi-tracks';
import { pixelsPerTick } from '@/states/piano-roll';

import { computed, inject } from 'vue';

const props = defineProps(['track']);

let eventRect = computed(() => {
  if (!props.track) return [];

  let events = props.track.notes;
  let result = [];

  for (let event of events) {
    let { start, length, key } = event;
    let startPixel = pixelsPerTick.value * start;

    let position = {
      bottom: 0,
      height: (event.velocity / 127) * 100 + '%',
      left: startPixel + 'px',
      width: '4px',
    };

    result.push({
      event,
      position,
    });
  }

  return result;
});
</script>

<template>
  <div class="relative">
    <!-- notes container -->
    <div
      v-for="({ event, position }, index) of eventRect"
      :key="index"
      class="absolute bg-red-500 border border-red-200"
      :style="position"
    ></div>
  </div>
</template>
