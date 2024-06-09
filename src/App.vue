<script setup lang="ts">
import PianoRoll from '@/views/PianoRoll.vue';
import TextInput from '@/components/TextInput.vue';

import MaterialIcon from '@/components/common/MaterialIcon.vue';

import { tick2Time, time2Tick } from './states/tempo-track';
import { quantitize } from './states/state';

import { setTempo } from '@/states/tempo-track';

import { key2Freq } from '@/states/constants';
import { Instrument, Note, Track, tracks, transportTick } from './states/midi-tracks';

import { setIntervalWithCancel } from './packages/timing';
import { reactive, ref, shallowReactive, shallowRef } from 'vue';

let context = null;
let previous = 0;
let canceller = null;

const stop = () => {
  if (context) {
    context.close();
    context = null;
    transportTick.value = previous;
    canceller();
  }
};

function renderOsc(context: BaseAudioContext, type: string, freq: number) {
  const osc = context.createOscillator();
  osc.frequency.value = freq;

  switch (type) {
    case 'sine':
    case 'sawtooth':
    case 'triangle':
    case 'square':
      osc.type = type;
      return osc;
  }

  // is 25% square
  const harmonics = 32;
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);

  for (let n = 1; n <= harmonics; n++) {
    let coefficient = Math.sin(Math.PI * n * 0.25) / (Math.PI * n);
    real[n] = 0; // Square wave only has sine components (imaginary)
    imag[n] = coefficient;
  }

  const customWave = context.createPeriodicWave(real, imag);
  osc.setPeriodicWave(customWave);
  return osc;
}

function renderNoise(context: BaseAudioContext) {
  // Create an AudioBuffer of white noise
  let bufferSize = 2048;
  let buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  let data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // Generate random values between -1 and 1
  }
  // Create a buffer source and connect it to the output
  let bufferSource = context.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.loop = true;
  return bufferSource;
}

function renderNote(
  { type, attack, decay, sustain, release }: Instrument,
  event: Note,
  offsetTime: number,
  target: AudioNode,
) {
  const startTick = event.start;
  const endTick = event.start + event.length;

  const endTime = tick2Time(endTick);
  if (!(endTime > offsetTime)) return;

  let startTime = tick2Time(startTick);
  startTime = Math.max(startTime, offsetTime);

  let noteStart = startTime - offsetTime;
  let noteEnd = endTime - offsetTime;

  const freq = key2Freq[event.key];
  let volume = event.velocity / 127;

  const context = target.context;
  let node: AudioScheduledSourceNode | null = null;
  if (type === 'noise') {
    node = renderNoise(context);
  } else {
    node = renderOsc(context, type, freq);
  }
  node.start(noteStart);
  node.stop(noteEnd + release);

  const envelope = context.createGain();
  const param = envelope.gain;
  param.value = 0;

  if (noteStart + attack > noteEnd) {
    // A-S
    let percent = (noteEnd - noteStart) / attack;
    // attack
    param.setValueAtTime(0, noteStart);
    param.linearRampToValueAtTime(volume * percent, noteEnd);
    // release
    param.linearRampToValueAtTime(0, noteEnd + release);
  } else if (noteStart + attack + decay > noteEnd) {
    // AD-S
    // attack
    param.setValueAtTime(0, noteStart);
    param.linearRampToValueAtTime(volume, noteStart + attack);
    // decay
    let percent = noteEnd - (noteStart + attack);
    param.linearRampToValueAtTime(volume * (1 - (1 - sustain) * percent), noteEnd);
    // release
    param.linearRampToValueAtTime(0, noteEnd + release);
  } else {
    // ADSR
    // attack
    param.setValueAtTime(0, noteStart);
    param.linearRampToValueAtTime(volume, noteStart + attack);
    // decay
    param.linearRampToValueAtTime(volume * sustain, noteStart + attack + decay);
    // release
    param.setValueAtTime(volume * sustain, noteEnd); // start release
    param.linearRampToValueAtTime(0, noteEnd + release);
  }

  node.connect(envelope);
  envelope.connect(target);
}

const play = () => {
  stop();

  context = new AudioContext({ sampleRate: 36000 });
  let gain = context.createGain();
  gain.gain.value = 1;
  gain.connect(context.destination);
  let target = gain;

  previous = transportTick.value;
  const offset = tick2Time(previous);

  for (let track of tracks) {
    let { notes, instrument } = track;

    let gain = context.createGain();
    gain.gain.value = instrument.volume;
    gain.connect(target);

    for (let event of notes) {
      renderNote(instrument, event, offset, gain);
    }
  }

  canceller = setIntervalWithCancel(() => {
    let t = context.currentTime + offset;
    transportTick.value = time2Tick(t);
  }, 25);

  return;
};

const focusTrack = shallowRef<Track | null>(null);
const selectedTrack = shallowReactive<Track[]>([]);

const handleTrackClick = (event: MouseEvent, track: Track) => {
  if (!event.ctrlKey) {
    focusTrack.value = track;
    selectedTrack.splice(0);
    return;
  }
};

const clearSelectedTrack = () => {
  focusTrack.value = null;
  selectedTrack.splice(0);
};

const addNewTrack = () => {
  let track = new Track();
  let length = tracks.push(track);
  track = tracks[length - 1];

  focusTrack.value = track;
  selectedTrack.splice(0);
};
</script>

<template>
  <div class="select-none w-screen h-screen bg-zinc-900 text-zinc-100 text-3/none overflow-hidden">
    <div class="flex flex-col size-full">
      <header class="flex-none h-10 flex gap-2 p-1 bg-zinc-800 mb-1">
        <div class="flex">
          <TextInput label="Start" size="8" value="1.1.2.0" />
          <TextInput label="End" size="8" value="2.1.4.119" />
          <TextInput label="Length" size="8" value="1.0.2.119" />
          <TextInput label="Pitch" size="2" value="A#3" />
          <TextInput label="Velocity" size="2" value="100" />
        </div>

        <span class="grow"></span>
        <button class="border rounded px-2 py-1" @click="play">Play</button>
        <button class="border rounded px-2 py-1" @click="stop">Stop</button>
        <span class="grow"></span>

        <div class="flex">
          <TextInput
            label="Tempo"
            size="2"
            value="136"
            @input="setTempo(0, parseInt($event.target.value))"
          />
          <TextInput label="Quantitize" size="2" v-model.number="quantitize" />

          <div class="flex items-center px-1 gap-1">
            <label v-text="'Tool'"></label>
            <select>
              <option value="pointer">Pointer</option>
              <option value="brush">Brush</option>
            </select>
          </div>
        </div>
      </header>
      <div class="flex-1 flex overflow-hidden gap-1">
        <aside class="w-44 flex-none my-container flex flex-col p-1 gap-1">
          <div class="h-7 p-1 flex gap-1 items-center">
            <MaterialIcon type="piano" />
            <span class="font-bold">Instrument</span>
          </div>
          <div class="h-0.5 bg-zinc-500"></div>
          <div class="flex flex-col grow justify-center items-center">
            <div v-if="!focusTrack">No Track Selected</div>
            <template v-else>
              <label>Instrument</label>
              <select v-model="focusTrack.instrument.type">
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="noise">Noise</option>
                <option value="25% square">25% Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="sine">Sine</option>
              </select>
              <TextInput label="Attack" size="8" v-model.number="focusTrack.instrument.attack" />
              <TextInput label="Decay" size="8" v-model.number="focusTrack.instrument.decay" />
              <TextInput label="Sustain" size="8" v-model.number="focusTrack.instrument.sustain" />
              <TextInput label="Release" size="8" v-model.number="focusTrack.instrument.release" />
              <TextInput label="Volume" size="8" v-model.number="focusTrack.instrument.volume" />
            </template>
          </div>
        </aside>
        <aside
          class="w-44 flex-none my-container flex flex-col p-1 gap-1"
          style="overflow-y: auto; scrollbar-width: thin"
          @click.stop="clearSelectedTrack"
        >
          <div class="h-7 p-1 flex gap-1 items-center">
            <MaterialIcon type="article" />
            <span class="font-bold">Track</span>
            <div class="grow"></div>
            <MaterialIcon type="add" @click.stop="addNewTrack" />
            <MaterialIcon type="delete" />
          </div>
          <div class="h-0.5 bg-zinc-500"></div>
          <div
            v-for="(track, index) of tracks"
            :key="track"
            class="flex-none h-12 flex flex flex-row items-center gap-1 p-1 rounded"
            :class="track === focusTrack ? 'bg-zinc-500' : 'bg-zinc-700'"
            @click.stop="handleTrackClick($event, track)"
          >
            <MaterialIcon type="music_note" />
            <div class="font-bold">Track {{ index + 1 }}</div>
            <div>{{ '(' + track.instrument.type + ')' }}</div>
            <div class="grow"></div>
            <div class="flex flex-col gap-1">
              <button class="border rounded p-0.5">M</button>
              <button class="border rounded p-0.5">S</button>
            </div>
          </div>
        </aside>
        <div class="flex-1 my-container p-1">
          <PianoRoll class="size-full" :track="focusTrack" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .contain-strict {
    contain: strict;
  }
}

input,
select {
  @apply bg-zinc-800;
}

.my-container {
  @apply border-2 rounded-md  border-zinc-400 bg-zinc-800;
  @apply overflow-hidden;
}
</style>
