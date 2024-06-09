/**
 *
 * @param condition The condition to test
 * @throws Error() if the condition evaluates to false
 */
export function assert(condition: boolean) {
  if (condition) return;
  throw Error('Assertion Failed');
}
