/**
 *
 * @param array A sorted array which can be partitioned by condition
 * @param condition The condition to test
 * @returns The last element and its corredponding index that satisfies the condition
 * @throws Error() if no element satisfies the condition
 */
export function bisect<T>(array: T[], condition: { (element: T): boolean }): [T, number] {
  // index < left satisfies the condition
  let left = 0;
  // index >= right does not satisfies the condition
  let right = array.length;

  while (left < right) {
    const mid = (left + right) >> 1;
    const element = array[mid];
    if (condition(element)) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  const index = left - 1;
  if (index < 0) {
    throw Error('no element matches condition');
  }

  const element = array[index];
  return [element, index];
}

export function bisect_nothrow<T>(array: T[], condition: { (element: T): boolean }): number {
  // index < left satisfies the condition
  let left = 0;
  // index >= right does not satisfies the condition
  let right = array.length;

  while (left < right) {
    const mid = (left + right) >> 1;
    const element = array[mid];
    if (condition(element)) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  const index = left - 1;
  return index;
}
