# Browser-Based Chiptune DAW (Digital Audio Workstation)

This project aims to bring the joy of creating chiptune-style music to the browser. The DAW interface allows users to compose melodies using a note editor, providing a simplistic yet powerful tool for music creation. Features include note editing, tracking, and playback controls, all within a browser environment. Whether you're a seasoned chiptune artist or a newcomer to the genre, this application offers a fun and accessible way to craft retro-inspired tunes right in your browser.

**WIP, expect non-functional controls. Many of the features are still to be implemented!**

## Basics

### Tracks and Instruments

- Click the '+' button to add a new track.
- Click on a track to display its contents.
- Edit instrument parameters to customize the sound.

## Note Editor

- Click on a blank space to create a new note. Adjust the quantize parameter to set the default length of new notes.
- Drag or click to select existing notes.
- Adjust the length of selected notes by dragging their borders. Currently, you can only change the end position.
- Press the Del key to delete the selected notes.
- Press the Up or Down arrow keys to adjust the pitch of the selected notes.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

After starting the local dev server, you can visit this [link](http://localhost:5173/#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) to play with a track I have already created with this application. You will need to mannually set the tempo to 136 for better playback experience.

**DISCLAIMER**: The track features a theme from the game [Okami](https://en.wikipedia.org/wiki/%C5%8Ckami) and I do not hold any right to the track. All rights belong to the original composer and publisher.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
