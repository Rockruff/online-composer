export const ticksPerQuarter = 480; // default MIDI resolution
export const ticksPerSixteenth = ticksPerQuarter / 4;
export const ticksPerWhole = ticksPerQuarter * 4;
export const secondsPerMinute = 60;

const key2Name: { [key: number]: string } = {};
const name2key: { [name: string]: number } = {};
const key2Freq: { [key: number]: number } = {};
const name2Freq: { [name: string]: number } = {};

const totalKeys = 128;
const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const offset = -2; // octave offset

for (let key = 0; key < totalKeys; ++key) {
  const remain = key % 12;
  const ratio = (key - remain) / 12;

  let name = names[remain];
  const octave = ratio + offset;
  name += octave; // full name with octave
  key2Name[key] = name;
  name2key[name] = key;

  const freq = 440 * 2 ** ((key - 57) / 12);
  key2Freq[key] = freq;
  name2Freq[name] = freq;
}

Object.freeze(key2Name);
Object.freeze(name2key);
Object.freeze(key2Freq);
Object.freeze(name2Freq);

export { totalKeys };
export { key2Name, name2key };
export { key2Freq, name2Freq };
