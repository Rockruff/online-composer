<script setup lang="ts">
import { totalKeys, key2Name, key2Freq } from '@/states/constants';

// TODO: after completing track playback, use sound of current track
let voices = {};

const play = (key, el) => {
  let pair = voices[key];
  if (pair) return;
  let context = new window.AudioContext();
  let vol = context.createGain();
  let count = 1;
  vol.gain.value = 0.05 / count; // from 0 to 1
  let oscs = [];
  for (let i = 0; i < count; ++i) {
    let osc = context.createOscillator();
    oscs.push(osc);
    osc.type = ['sine', 'square', 'sawtooth', 'triangle'][2];
    if (i == 0) {
      osc.frequency.value = key2Freq[key];
    } else {
      osc.frequency.value = key2Freq[key] * (1 + 0.01 * ((Math.random() - 0.5) / 0.5));
    }
    osc.connect(vol);
    osc.start();
  }
  vol.connect(context.destination);
  voices[key] = [oscs, vol, context];
  el.setAttribute('aria-pressed', 'true');
};

const stop = (key, el) => {
  let pair = voices[key];
  if (!pair) return;
  delete voices[key];
  setTimeout(() => {
    let [oscs, vol, context] = pair;
    vol.disconnect();
    for (let osc of oscs) {
      osc.stop();
      osc.disconnect();
    }
    context.close();
  }, 50);
  el.removeAttribute('aria-pressed');
};

const handlekeypress = (e) => {
  let { code } = e;

  let mapping = {
    KeyQ: 48,
    Digit2: 49,
    KeyW: 50,
    Digit3: 51,
    KeyE: 52,
    KeyR: 53,
    Digit5: 54,
    KeyT: 55,
    Digit6: 56,
    KeyY: 57,
    Digit7: 58,
    KeyU: 59,
    KeyI: 60,
    Digit9: 61,
    KeyO: 62,
    Digit0: 63,
    KeyP: 64,
    BracketLeft: 65,
    Equal: 66,
    BracketRight: 67,
  };

  let key = mapping[code];
  if (!key) return;

  let el = e.currentTarget.children[127 - key];
  if (e.type === 'keydown') play(key, el);
  else stop(key, el);
};
</script>

<template>
  <ol
    class="piano-roll-keyboard"
    tabindex="-1"
    @keydown.stop.prevent="handlekeypress"
    @keyup.stop.prevent="handlekeypress"
  >
    <li
      v-for="i of totalKeys /* i start from 1 */"
      :key="totalKeys - i"
      v-text="key2Name[totalKeys - i]"
      @mousedown.stop="$event.buttons === 1 ? play(totalKeys - i, $event.currentTarget) : 0"
      @mouseover.stop="$event.buttons === 1 ? play(totalKeys - i, $event.currentTarget) : 0"
      @mouseout.stop="$event.buttons === 1 ? stop(totalKeys - i, $event.currentTarget) : 0"
      @mouseup.stop.left="stop(totalKeys - i, $event.currentTarget)"
    ></li>
  </ol>
</template>

<style>
.piano-roll-keyboard {
  @apply relative; /* for absolute children */
}

.piano-roll-keyboard > :nth-last-child(12n + 2),
.piano-roll-keyboard > :nth-last-child(12n + 4),
.piano-roll-keyboard > :nth-last-child(12n + 7),
.piano-roll-keyboard > :nth-last-child(12n + 9),
.piano-roll-keyboard > :nth-last-child(12n + 11) {
  @apply w-2/3;
  @apply h-[0.78125%]; /* 1/128 */
  @apply bg-neutral-900;
  @apply hover:bg-neutral-700;
  @apply aria-pressed:bg-sky-700;
  @apply absolute;
  @apply -translate-y-1/2; /* move 1/2 upwards */
}

.piano-roll-keyboard > :nth-last-child(12n + 1),
.piano-roll-keyboard > :nth-last-child(12n + 3),
.piano-roll-keyboard > :nth-last-child(12n + 5),
.piano-roll-keyboard > :nth-last-child(12n + 6),
.piano-roll-keyboard > :nth-last-child(12n + 8),
.piano-roll-keyboard > :nth-last-child(12n + 10),
.piano-roll-keyboard > :nth-last-child(12n) {
  @apply w-full;
  @apply bg-neutral-100;
  @apply hover:bg-neutral-200;
  @apply aria-pressed:bg-sky-200;
  @apply border-b;
  @apply border-neutral-400;
}

.piano-roll-keyboard > :nth-last-child(12n + 3),
.piano-roll-keyboard > :nth-last-child(12n + 8),
.piano-roll-keyboard > :nth-last-child(12n + 10) {
  @apply h-[1.5625%]; /* 2/128 */
}

.piano-roll-keyboard > :nth-last-child(12n + 1),
.piano-roll-keyboard > :nth-last-child(12n + 5),
.piano-roll-keyboard > :nth-last-child(12n + 6),
.piano-roll-keyboard > :nth-last-child(12n),
.piano-roll-keyboard > :first-child /* Key #127 */ {
  @apply h-[1.171875%]; /* 1.5/128 */
}

.piano-roll-keyboard > * {
  @apply leading-normal text-right pr-0.5;
  @apply text-transparent; /* hide key name by default */
}

.piano-roll-keyboard > :nth-last-child(12n + 1) {
  @apply text-black; /* show key name for C */
}
</style>
