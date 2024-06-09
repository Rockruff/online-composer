<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue';
import { initCustomMouseEvent, uninitCustomMouseEvent } from '@/packages/mouseevent';
import { totalKeys } from '@/states/constants';

const selectedEvents = reactive(new Set());

const props = defineProps(['track']);

import { inject } from 'vue';

import { pixelsPerKey, pixelsPerTick } from '@/states/piano-roll';

import { tracks } from '@/states/midi-tracks';
import { quantitize } from '@/states/state';

let eventRect = computed(() => {
  if (!props.track) return [];

  let events = props.track.notes;
  let result = [];

  for (let event of events) {
    let { start, length, key } = event;
    let startPixel = pixelsPerTick.value * start;
    let endPixel = pixelsPerTick.value * (start + length);

    let position = {
      top: (127 - key) * pixelsPerKey.value,
      height: pixelsPerKey.value,
      left: startPixel,
      width: endPixel - startPixel,
    };

    result.push({
      event,
      position,
    });
  }

  return result;
});

function toCSS(event, position) {
  let style = {};
  for (let key in position) {
    style[key] = position[key] + 'px';
  }
  let { key } = event;
  style.top = ((totalKeys - 1 - key) / totalKeys) * 100 + '%';
  style.height = 100 / totalKeys + '%';
  return style;
}

const selectionRect = reactive({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});

/* handle selection change */

const initSelection = (e) => {
  let { el } = e;
  initCustomMouseEvent(el, {
    click: (e) => {
      let oldCount = selectedEvents.size;

      let rect = el.getBoundingClientRect();
      let x = e.clientX - rect.left; //x position within the element.
      let y = e.clientY - rect.top; //y position within the element.

      for (let { event, position } of eventRect.value) {
        let nw = position.width;
        let nh = position.height;

        let nl = position.left;
        let nr = nl + nw;
        let nt = position.top;
        let nb = nt + nh;

        if (nl > x || nr < x || nt > y || nb < y) {
          selectedEvents.delete(event);
        } else {
          selectedEvents.add(event);
        }
      }

      let newCount = selectedEvents.size;
      if (newCount === 0) {
        if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

        let key = 127 - Math.floor((y / rect.height) * 128);
        let start = x / pixelsPerTick.value;
        const q = quantitize.value;
        start = Math.floor(start / q) * q;

        let event = { start, length: q, key, velocity: 120 };
        props.track.notes.push(event);
        selectedEvents.add(event);
      }
    },
    down: (e, context) => {
      let rect = el.getBoundingClientRect();
      context.left = e.clientX - rect.left; //x position within the element.
      context.top = e.clientY - rect.top; //y position within the element.
    },
    move: (e, context) => {
      let rect = el.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      console.log(x, y);

      let { left, top } = context;
      let width = Math.abs(left - x);
      left = Math.min(left, x);
      let height = Math.abs(top - y);
      top = Math.min(top, y);

      selectionRect.left = left + 'px';
      selectionRect.top = top + 'px';
      selectionRect.width = width + 'px';
      selectionRect.height = height + 'px';

      for (let { event, position } of eventRect.value) {
        let nw = position.width;
        let nh = position.height;

        let nl = position.left;
        let nr = nl + nw;
        let nt = position.top;
        let nb = nt + nh;

        let sl = left;
        let sr = left + width;
        let st = top;
        let sb = top + height;

        if (nl > sr || nr < sl || nt > sb || nb < st) {
          selectedEvents.delete(event);
        } else {
          selectedEvents.add(event);
        }
      }

      //    console.log(left, top, width, height);
    },
    up: (e, context) => {
      selectionRect.width = 0;
      selectionRect.height = 0;

      let rect = el.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      let { left, top } = context;
      let width = Math.abs(left - x);
      left = Math.min(left, x);
      let height = Math.abs(top - y);
      top = Math.min(top, y);
    },
  });
};

const deleteSelectedNotes = () => {
  let events = props.track.notes;
  events = events.filter((event) => !selectedEvents.has(event));
  selectedEvents.clear();
  props.track.notes = events;
};

const handleKeyEvent = (e: KeyboardEvent) => {
  e.preventDefault();
  switch (e.code) {
    case 'Delete':
      deleteSelectedNotes();
      break;
    case 'ArrowDown':
      for (let event of selectedEvents) {
        if (event.key > 0) event.key -= 1;
      }
      break;
    case 'ArrowUp':
      for (let event of selectedEvents) {
        if (event.key < 127) event.key += 1;
      }
      break;
    default:
      return;
  }
  e.stopPropagation();
};

const initResizeNote = (e) => {
  let { el } = e;
  initCustomMouseEvent(
    el,
    {
      down: (e, context) => {
        context.sx = e.clientX;
        context.tk = 0;
      },
      move: (e, context) => {
        let dx = e.clientX - context.sx;
        let tk = dx / pixelsPerTick.value;
        const q = quantitize.value;
        tk = Math.floor(tk / q) * q;

        let otk = context.tk;
        context.tk = tk;

        console.log(tk, otk);
        tk = tk - otk;

        for (let event of selectedEvents) {
          event.length += tk;
          event.length = Math.round(event.length);
          if (event.length < 1) event.length = 1;
        }
      },
      up: (e, context) => {},
    },
    true,
  );
};
</script>

<template>
  <div
    class="relative"
    @vue:mounted="initSelection"
    @vue:beforeunmount="
      (e) => {
        console.log('unmount');
        let { el } = e;
        uninitCustomMouseEvent(el);
      }
    "
    tabindex="-1"
    @keydown="handleKeyEvent"
  >
    <!-- notes container -->
    <div>
      <div
        v-for="({ event, position }, index) of eventRect"
        :key="index"
        class="absolute"
        :style="toCSS(event, position)"
      >
        <div
          v-if="selectedEvents.has(event)"
          class="absolute left-[-1px] right-[-1px] top-[-1px] bottom-[-1px] bg-zinc-300 cursor-ew-resize"
          @vue:mounted="initResizeNote"
        ></div>
        <div class="absolute left-0 right-0 top-0 bottom-0 bg-red-500"></div>
      </div>
    </div>
    <div
      v-show="selectionRect.width && selectionRect.height"
      :style="selectionRect"
      class="border absolute"
    ></div>
  </div>
</template>
