// Previously, the time meter reflected the accurate time scale, where the length of
// a quarter note varied depending on the tempo. This required converting MIDI ticks
// to seconds to determine pixel locations on screen, which affected performance
// due to the frequent conversions and the need to update locations dynamically when
// the tempo track changed. Additionally, dramatic speed changes in compositions made
// it difficult for users to find a comfortable horizontal scaling factor. To address
// these issues, the time meter will now be based on MIDI ticks and will not reflect
// playback speed. This approach enhances performance and provides a more consistent
// user experience.

import { shallowRef, triggerRef } from 'vue';
import { ticksPerWhole } from '@/states/constants';
import { bisect } from '@/packages/bisect';

const ValidNumerator = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
const ValidDenominator = new Set([1, 2, 4, 8, 16]);

class TimeSignature {
  /* original */
  bar: number; // start bar
  cpb: number; // numberator, cpb per bar
  cpw: number; // denominator, cpb per whole note

  /* computed */
  tick: number; // start tick
  tpc: number; // ticks per click
  tpb: number; // ticks per bar

  constructor(bar: number, cpb: number, cpw: number, tick: number) {
    this.bar = bar;
    this.cpb = cpb;
    this.cpw = cpw;
    this.tick = tick;
    this.tpc = ticksPerWhole / cpw;
    this.tpb = this.tpc * cpb;
  }
}

const signatures = [
  // default signature is 4/4
  new TimeSignature(0, 4, 4, 0),
];

// ref used for reactivity
// if a function need to work with reactivity,
// then it must use `reactive.value` instead of `signatures`
// only use shallowRef to avoid unnecessary overheads
const reactive = shallowRef(signatures);

const recalculateTick = (index: number) => {
  const { length } = signatures;
  let previous = signatures[index];

  while (++index < length) {
    const current = signatures[index];
    // get length of previous range
    const bars = current.bar - previous.bar;
    const ticks = bars * previous.tpb;
    // update time for sigs after index
    current.tick = previous.tick + ticks;
    // update previous for the next loop
    previous = current;
  }

  // notify subscribers that data have been changed
  triggerRef(reactive);
};

/**
 *
 * @param bar The bar number to set time signature at
 * @param cpb The numerator of the time signature, known as beats (clicks) per bar
 * @param cpw The denominator of the time signature, known as beats (clicks) per whole
 * @returns
 */
export const setTimeSignature = (bar: number, cpb: number, cpw: number) => {
  if (!Number.isInteger(bar) || bar < 0) return;
  if (!ValidNumerator.has(cpb)) return;
  if (!ValidDenominator.has(cpw)) return;

  // find insert position
  const [element, index] = bisect(signatures, (sig) => sig.bar <= bar);

  if (element.bar === bar) {
    // update existing sig, keep sig.tick as it is
    const sig = new TimeSignature(bar, cpb, cpw, element.tick);
    signatures[index] = sig;
  } else {
    // insert new sig, sig.tick will be calculated later
    const sig = new TimeSignature(bar, cpb, cpw, 0);
    signatures.splice(index + 1, 0, sig);
  }

  // update affected items
  recalculateTick(index);
};

/**
 *
 * @param bar The bar number to remove time signature from
 * @returns
 */
export const unsetTimeSignature = (bar: number) => {
  // the starting one cannot be deleted
  if (!Number.isInteger(bar) || bar <= 0) return;

  // find delete position
  const [sig, index] = bisect(signatures, (sig) => sig.bar <= bar);
  if (sig.bar !== bar) return;

  // remove if found
  signatures.splice(index, 1);

  // update affected items
  recalculateTick(index - 1);
};

/**
 *
 * @param bar Bar number
 * @returns The ruling time signature for the bar
 */
export const getTimeSignatureByBar = (bar: number) => {
  // this function may be used in computed() so need to be reactive
  const signatures = reactive.value;
  const [sig] = bisect(signatures, (sig) => sig.bar <= bar);
  return sig;
};

/**
 *
 * @param tick Tick position
 * @returns The ruling time signature for the position
 */
export const getTimeSignatureByTick = (tick: number) => {
  // this function may be used in computed() so need to be reactive
  const signatures = reactive.value;
  const [sig] = bisect(signatures, (sig) => sig.tick <= tick);
  return sig;
};

export const getTimeSignatures = () => {
  const signatures = reactive.value;
  return signatures;
};

// const idivmod = (x: number, y: number) => {
//   x = x | 0;
//   y = y | 0;
//   let d = x / y;
//   d = d | 0;
//   let r = x % y;
//   r = r | 0;
//   return [d, r];
// };

// const formatHelper = (sig: TimeSignature, ticks: number) => {
//   const [v1, r1] = idivmod(ticks, sig.tpb);
//   const [v2, r2] = idivmod(r1, sig.tpc);
//   const [v3, r3] = idivmod(r2, ticksPerSixteenth);
//   // [bar, beat, sixteenth, tick]
//   return [v1, v2, v3, r3];
// };

// export const formatEventPosition = (tick: number) => {
//   const signatures = reactive.value;
//   const [sig] = bisect(signatures, (sig) => sig.tick <= tick);

//   const ticks = tick - sig.tick;
//   const result = formatHelper(sig, ticks);

//   result[0] += sig.bar; // convert to actual bar
//   result[1] += 1; // start from 1 for human readibility
//   result[2] += 1; // start from 1 for human readibility
//   return result;
// };

// export const formatEventLength = (start: number, length: number) => {
//   const signatures = reactive.value;
//   const [sig] = bisect(signatures, (sig) => sig.tick <= start);

//   const result = formatHelper(sig, length);
//   return result;
// };

// export const parseEventLength = (bar: number, beat: number, sixteenth: number, tick: number) => {
//   if (bar < 0 || beat < 0 || sixteenth < 0 || tick < 0) throw Error('Invalid Input');
// };

// export const parseTimeMeterPosition = () => {};

// export const formattedToTick = () => {};
