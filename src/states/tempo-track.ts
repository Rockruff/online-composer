import { bisect } from '@/packages/bisect';
import { ticksPerQuarter, secondsPerMinute } from '@/states/constants';

// the factor to convert quartersPerMinute to ticksPerSecond
const qpm2tps = ticksPerQuarter / secondsPerMinute;

class TempoChange {
  /* original */
  tick: number; // tick of event
  qpm: number; // quarters per minute

  /* computed */
  time: number; // time of event (tick converted to second)
  tps: number; // ticks per second

  constructor(tick: number, qpm: number, time: number) {
    this.tick = tick;
    this.qpm = qpm;
    this.time = time;
    this.tps = qpm * qpm2tps;
  }
}

const events: TempoChange[] = [
  // default speed is 120
  new TempoChange(0, 120, 0),
];

const recalculateTime = (index: number) => {
  const { length } = events;
  let previous = events[index];

  while (++index < length) {
    const current = events[index];
    // get length of previous range
    const ticks = current.tick - previous.tick;
    const seconds = ticks / previous.tps;
    // update time for events after index
    current.time = previous.time + seconds;
    // update previous for the next loop
    previous = current;
  }
};

export const setTempo = (tick: number, qpm: number) => {
  if (!Number.isInteger(tick) || tick < 0) return;
  if (!Number.isInteger(qpm) || qpm <= 0) return;

  // find insert position
  const [element, index] = bisect(events, (event) => event.tick <= tick);

  if (element.tick === tick) {
    // update existing event, keep event.time as it is
    const event = new TempoChange(tick, qpm, element.time);
    events[index] = event;
  } else {
    // insert new event, event.time will be calculated later
    const event = new TempoChange(tick, qpm, 0);
    events.splice(index + 1, 0, event);
  }

  // update affected items
  recalculateTime(index);
};

export const unsetTempo = (tick: number) => {
  // the starting one cannot be deleted
  if (!Number.isInteger(tick) || tick <= 0) return;

  // find delete position
  const [event, index] = bisect(events, (event) => event.tick <= tick);
  if (event.tick !== tick) return;

  // remove if found
  events.splice(index, 1);

  // update affected items
  recalculateTime(index - 1);
};

export const tick2Time = (tick: number) => {
  const [event] = bisect(events, (event) => event.tick <= tick);
  const ticks = tick - event.tick;
  const seconds = ticks / event.tps;
  return event.time + seconds;
};

export const time2Tick = (time: number) => {
  const [event] = bisect(events, (event) => event.time <= time);
  const seconds = time - event.time;
  const ticks = seconds * event.tps;
  return Math.round(event.tick + ticks); // tick can only be integers ...
};
