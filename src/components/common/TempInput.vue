<script setup lang="ts">
import { caretPositionFromMouseEvent } from '@/packages/caretposition';

const props = defineProps<{
  value: string;
}>();

const emit = defineEmits<{
  commit: [value: string];
}>();

const beginEdit = (event: MouseEvent) => {
  // element is the root element of component
  let element = event.currentTarget! as HTMLElement;

  // if click within the element during edit, do nothing
  const contenteditable = 'contenteditable';
  if (element.hasAttribute(contenteditable)) return;

  // backup the original text
  let originalText = element.textContent!;

  // set caret position from mouse click
  let selection = window.getSelection()!;
  let [node, offset] = caretPositionFromMouseEvent(event);
  selection.collapse(node, offset);

  const endEdit = () => {
    // end edit
    element.removeAttribute(contenteditable);

    // remove selection if being blurred
    // this is important because if the whole page has user-select = none
    // blurring will not automatically clear the selection in the element
    selection.removeAllRanges();

    // do nothing if not changed...
    let editedText = element.textContent!;
    if (editedText === originalText) return;

    // always restore original text
    // so if user input is invalid and state does not change
    // the text will look like original
    element.textContent = originalText;

    // emit an event to the parent component
    // if user input is valid, then the state will changed by handlers in parent
    emit('commit', editedText);
  };

  // commit result on blur
  element.addEventListener('blur', endEdit, { once: true });

  // begin edit and focus element
  element.setAttribute(contenteditable, 'true');
  element.focus();
};
</script>

<template>
  <div
    class="outline-none text-zinc-400 bg-zinc-700 focus:text-zinc-100 focus:bg-zinc-600"
    v-text="props.value"
    @click.stop.left="beginEdit"
  ></div>
</template>
