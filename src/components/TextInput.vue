<script setup lang="ts">
import { ref } from 'vue';
defineProps(['label', 'value', 'size']);
const model = defineModel();
</script>

<template>
  <div class="flex items-center px-1 gap-1">
    <label v-text="label"></label>
    <input
      class="px-0.5 outline-none text-zinc-400 bg-zinc-700 focus:text-zinc-100 focus:bg-zinc-600"
      v-model="model"
      :size
    />
  </div>
</template>
