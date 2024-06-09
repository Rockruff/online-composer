import { key2Freq } from './constants';
import { transportTick, type Instrument, type Note } from './midi-tracks';
import { tick2Time } from './tempo-track';

class TransportManager {
  stop: () => void;
  constructor() {
    this.stop = () => {};
  }
  play() {}
}

const renderNote = (instrument: Instrument, event: Note, offsetTime: number, target: AudioNode) => {
  const startTick = event.start;
  const endTick = event.start + event.length;

  const endTime = tick2Time(endTick);
  if (!(endTime > offsetTime)) return;

  let startTime = tick2Time(startTick);
  startTime = Math.max(startTime, offsetTime);
  const length = endTime - startTime;

  const attackStart = startTime - offsetTime;
  const releaseStart = endTime - offsetTime;
  let attackEnd = attackStart + instrument.attack;
  const releaseEnd = releaseStart + instrument.release;

  const freq = key2Freq[event.key];
  let volume = event.velocity / 127;
  if (length < instrument.attack) {
    volume *= length / instrument.attack;
    attackEnd = releaseStart;
  }

  const context = target.context;
  const osc = context.createOscillator();
  osc.type = instrument.type;
  osc.frequency.value = freq;
  osc.start(attackStart);
  osc.stop(releaseEnd);

  const envelope = context.createGain();
  const param = envelope.gain;
  param.setValueAtTime(0, attackStart); // start attack
  param.linearRampToValueAtTime(volume, attackEnd); // end attack
  param.setValueAtTime(volume, releaseStart); // start release
  param.linearRampToValueAtTime(0, releaseEnd); // end release

  osc.connect(envelope);
  envelope.connect(target);
};

const play = () => {
  stop();

  const events = tracks[0].notes;

  context = new AudioContext();

  const begin = context.currentTime;

  for (const event of events) {
    const { start, length, key } = event;
    let startTime = tick2Time(start);
    const endTime = tick2Time(start + length);

    if (endTime < offset) continue;
    if (startTime < offset) startTime = offset;

    const osc = context.createOscillator();
    osc.type = 'sawtooth'; // sine, square, sawtooth, triangle

    osc.frequency.value = key2Freq[key];
    const vol = context.createGain();
    vol.gain.value = 0.1; // from 0 to 1
    osc.connect(vol);
    vol.connect(context.destination);
    osc.start(begin - offset + startTime);
    osc.stop(begin - offset + endTime + 0.05);
  }

  canceller = setIntervalWithCancel(() => {
    const t = context.currentTime - begin + offset;
    console.log(context.currentTime);
    transportTick.value = time2Tick(t);
  }, 25);

  return;
};

let canceller = () => {};
let context = new AudioContext();
