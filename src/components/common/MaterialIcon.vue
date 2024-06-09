<script setup lang="ts">
const props = defineProps<{
  type: string;
}>();
</script>

<template>
  <span class="font-icon" v-text="props.type"></span>
</template>

<style>
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v183/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2)
    format('woff2');
}

.font-icon {
  font-family: 'Material Symbols Outlined';
  line-height: 1;
}
</style>
