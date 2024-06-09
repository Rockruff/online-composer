import { bisect, bisect_nothrow } from '@/packages/bisect';
import { compressJson, decompressJson } from '@/packages/compression';
import { computed, reactive, ref, shallowRef, watch } from 'vue';

export class Note {
  start: number;
  length: number;
  key: number;
  velocity: number;

  get end() {
    return this.start + this.length;
  }

  constructor(start: number, length: number, key: number, velocity: number) {
    this.start = start;
    this.length = length;
    this.key = key;
    this.velocity = velocity;
  }
}

export class Instrument {
  type: 'square' | 'triangle' | 'noise' | '25% square' | 'sawtooth' | 'sine';
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;

  constructor() {
    this.type = 'sine';
    this.attack = 0.01;
    this.decay = 0;
    this.sustain = 1;
    this.release = 0.25;
    this.volume = 0.25;
  }
}

export class Track {
  notes: Note[];
  instrument: Instrument;

  constructor() {
    this.notes = [];
    this.instrument = new Instrument();
  }

  addNote(start: number, length: number, key: number, velocity: number): Note {
    const notes = this.notes;
    const evt = new Note(start, length, key, velocity);
    const index = bisect_nothrow(notes, (event) => event.start <= evt.start);
    notes.splice(index + 1, 0, evt);
    return evt;
  }

  removeNote(note: Note) {
    const notes = this.notes;
    const index = notes.indexOf(note);
    if (index < 0) return;
    notes.splice(index, 1);
  }
}

export const tracks = reactive<Track[]>([]);

{
  let data = null;
  if (location.hash) {
    try {
      const hash = location.hash.substring(1);
      data = decompressJson(hash);
    } catch (e) {
      /* empty */
      data = null;
    }
  }

  if (data) {
    for (const { notes, instrument } of data) {
      const track = new Track();
      Object.assign(track.instrument, instrument);
      for (const { start, length, key, velocity } of notes) {
        const note = new Note(start, length, key, velocity);
        track.notes.push(note);
      }
      tracks.push(track);
    }
  }
}

watch(tracks, (v) => {
  const compressed = compressJson(v);
  location.hash = compressed;
});

export const transportTick = shallowRef(0);
