/**
 *
 * @param handler A function to be executed after the timer expires
 * @param timeout The time, in milliseconds that the timer should wait before the specified function is executed
 * @param args Additional arguments which are passed through to the handler
 * @returns A function to cancel the timer
 */
export const setTimeoutWithCancel = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
  const id = setTimeout(handler, timeout, ...args);
  const cancel = () => clearTimeout(id);
  return cancel;
};

/**
 *
 * @param handler A function to be executed every delay milliseconds
 * @param delay The time, in milliseconds that the timer should delay in between executions of the specified function
 * @param args Additional arguments which are passed through to the handler
 * @returns A function to cancel the interval
 */
export const setIntervalWithCancel = (handler: TimerHandler, delay?: number, ...args: any[]) => {
  const id = setInterval(handler, delay, ...args);
  const cancel = () => clearInterval(id);
  return cancel;
};
