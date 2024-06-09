export const caretPositionFromPoint = document.caretPositionFromPoint
  ? function (clientX: number, clientY: number): [Node | null, number] {
      const range = document.caretPositionFromPoint(clientX, clientY);
      if (!range) return [null, 0];
      const node = range.offsetNode;
      const offset = range.offset;
      return [node, offset];
    }
  : function (clientX: number, clientY: number): [Node | null, number] {
      // Use WebKit-proprietary fallback method
      const range = document.caretRangeFromPoint(clientX, clientY);
      if (!range) return [null, 0];
      const node = range.startContainer;
      const offset = range.startOffset;
      return [node, offset];
    };

export function caretPositionFromMouseEvent(e: MouseEvent) {
  const { clientX, clientY } = e;
  return caretPositionFromPoint(clientX, clientY);
}
