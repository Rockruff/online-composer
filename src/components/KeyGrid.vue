<script setup lang="ts">
import { totalKeys } from '@/states/constants';
</script>

<template>
  <ul class="piano-roll">
    <li v-for="i of totalKeys" :key="i"></li>
  </ul>
</template>

<style>
.piano-roll > * {
  @apply h-[0.78125%]; /* 1/128 */
}

.piano-roll > :nth-last-child(12n + 2),
.piano-roll > :nth-last-child(12n + 4),
.piano-roll > :nth-last-child(12n + 7),
.piano-roll > :nth-last-child(12n + 9),
.piano-roll > :nth-last-child(12n + 11) {
  @apply bg-zinc-800;
}

.piano-roll > :nth-last-child(12n + 1),
.piano-roll > :nth-last-child(12n + 3),
.piano-roll > :nth-last-child(12n + 5),
.piano-roll > :nth-last-child(12n + 6),
.piano-roll > :nth-last-child(12n + 8),
.piano-roll > :nth-last-child(12n + 10),
.piano-roll > :nth-last-child(12n) {
  @apply bg-zinc-700;
}

.piano-roll > :nth-last-child(12n + 1),
.piano-roll > :nth-last-child(12n + 6) {
  @apply border-b border-zinc-500;
}
</style>
