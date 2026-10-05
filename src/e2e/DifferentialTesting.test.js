import { describe, it, expect } from 'vitest';
import {
  generateSecondVoice,
  resolveSopranoSound,
  noteToMidi,
  getDegreeOfNote,
} from '../Generators/CounterpointGenerator';
import { generateSong } from '../Generators/MusicGenerator';
import {
  MAJOR_SCALES,
  CURRENT_SOUNDS,
  changeScale,
  CURRENT_SCALE,
  getCanonicalPianoNote,
  getNotationForPlay,
} from '../Constants';

// Mulberry32 deterministic PRNG
function createPrng(seed = 999) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Legacy translateForTone implementation (solo melody only)
 */
function legacyTranslateForTone(song, scaleKey = CURRENT_SCALE) {
  const newSong = [];
  for (let i = 0; i < song.length; i++) {
    let currentTempo = 0;
    const notes = song[i].notes;
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];
      const sound = resolveSopranoSound(note, scaleKey);
      const duration = getNotationForPlay(note.duration);
      newSong.push({
        time: i + ':' + currentTempo,
        note: sound,
        canonicalNote: getCanonicalPianoNote(sound),
        duration: duration,
        vfId: `vf-${i}-${j}`,
      });
      currentTempo += note.duration;
    }
  }
  return newSong;
}

/**
 * New polyphonic translateForTone implementation supporting second voice
 */
function polyphonicTranslateForTone(song, secondVoice, scaleKey = CURRENT_SCALE) {
  const events = [];
  const hasSecondVoice = Boolean(secondVoice && secondVoice.length > 0);

  for (let i = 0; i < song.length; i++) {
    let currentTempo = 0;
    const notes = song[i].notes;
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];
      const sound = resolveSopranoSound(note, scaleKey);
      const duration = getNotationForPlay(note.duration);
      events.push({
        time: i + ':' + currentTempo,
        note: sound,
        canonicalNote: getCanonicalPianoNote(sound),
        duration: duration,
        vfId: hasSecondVoice ? `vf-top-${i}-${j}` : `vf-${i}-${j}`,
      });
      currentTempo += note.duration;
    }
  }

  if (hasSecondVoice) {
    for (let i = 0; i < secondVoice.length; i++) {
      let currentTempo = 0;
      const notes = secondVoice[i].notes;
      for (let j = 0; j < notes.length; j++) {
        const note = notes[j];
        const sound = note.soundName || 'C3';
        const duration = getNotationForPlay(note.duration);
        events.push({
          time: i + ':' + currentTempo,
          note: sound,
          canonicalNote: getCanonicalPianoNote(sound),
          duration: duration,
          vfId: `vf-bottom-${i}-${j}`,
        });
        currentTempo += note.duration;
      }
    }
  }

  return events;
}

describe('Differential Testing: Old vs New System Equivalence', () => {
  const SCALES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#'];

  it('compares solo melody before and after counterpoint augmentation across 300 random inputs', () => {
    const prng = createPrng(777);

    for (let i = 0; i < 300; i++) {
      const scale = SCALES[Math.floor(prng() * SCALES.length)];
      const numMeasures = Math.floor(prng() * 10) + 2;

      changeScale(scale);
      const originalSong = generateSong(numMeasures);

      // Deep clone snapshot before second voice generation
      const snapshotSong = JSON.parse(JSON.stringify(originalSong));

      // Augment with second voice
      const secondVoice = generateSecondVoice(originalSong, scale);

      // The original song data must be strictly preserved (non-destructive)
      expect(originalSong).toEqual(snapshotSong);

      // Second voice must have identical measure count
      expect(secondVoice.length).toBe(originalSong.length);
    }
  });

  it('compares pitch resolution: stateless pure resolveSopranoSound vs legacy global CURRENT_SOUNDS', () => {
    const prng = createPrng(888);

    SCALES.forEach((scaleKey) => {
      // Synchronize global scale
      changeScale(scaleKey);

      for (let test = 0; test < 50; test++) {
        const noteIndex = Math.floor(prng() * 8); // Diatonic degree index 0..7
        const noteObj = { sound: noteIndex };

        const resolvedSound = resolveSopranoSound(noteObj, scaleKey);
        const legacySound = CURRENT_SOUNDS[noteIndex];

        // When global scale is in sync, both should resolve to the exact same pitch string
        expect(resolvedSound).toBe(legacySound);

        // Verify the resolved sound degree matches noteIndex + 1 (degrees 1..7, with degree 8 mapped to 1)
        const expectedDegree = (noteIndex % 7) + 1;
        const actualDegree = getDegreeOfNote(resolvedSound, scaleKey);
        expect(actualDegree).toBe(expectedDegree);
      }
    });
  });

  it('compares translateForTone: solo baseline vs polyphonic translation across 200 random songs', () => {
    const prng = createPrng(555);

    for (let run = 0; run < 200; run++) {
      const scaleKey = SCALES[Math.floor(prng() * SCALES.length)];
      const measures = Math.floor(prng() * 8) + 3;

      changeScale(scaleKey);
      const song = generateSong(measures);
      const secondVoice = generateSecondVoice(song, scaleKey);

      const soloEvents = legacyTranslateForTone(song, scaleKey);
      const polyEvents = polyphonicTranslateForTone(song, secondVoice, scaleKey);

      // 1. Separate polyphonic events into soprano and bass
      const polySoprano = polyEvents.filter((e) => e.vfId.startsWith('vf-top-'));
      const polyBass = polyEvents.filter((e) => e.vfId.startsWith('vf-bottom-'));

      // 2. Soprano event count in polyphony must exactly equal solo baseline
      expect(polySoprano.length).toBe(soloEvents.length);

      // 3. Every soprano event in polyphony must have identical musical properties to solo baseline
      for (let k = 0; k < soloEvents.length; k++) {
        const soloEv = soloEvents[k];
        const polyEv = polySoprano[k];

        expect(polyEv.time).toBe(soloEv.time);
        expect(polyEv.note).toBe(soloEv.note);
        expect(polyEv.canonicalNote).toBe(soloEv.canonicalNote);
        expect(polyEv.duration).toBe(soloEv.duration);
        // vfId format transformation
        expect(polyEv.vfId).toBe(soloEv.vfId.replace('vf-', 'vf-top-'));
      }

      // 4. Bass events must only exist in polyphony and each must have valid musical attributes
      expect(polyBass.length).toBeGreaterThan(0);
      polyBass.forEach((bassEv) => {
        expect(bassEv.time).toBeDefined();
        expect(bassEv.note).toBeDefined();
        expect(bassEv.canonicalNote).toBeDefined();
        expect(bassEv.duration).toBeDefined();
      });
    }
  });

  it('compares multiple counterpoint variations over the same melody for structural consistency', () => {
    const song = generateSong(8);
    const scale = 'G';

    const variation1 = generateSecondVoice(song, scale);
    const variation2 = generateSecondVoice(song, scale);

    // Both variations must have the exact same measure count
    expect(variation1.length).toBe(song.length);
    expect(variation2.length).toBe(song.length);

    // Both variations must start on tonic and end on tonic
    expect(getDegreeOfNote(variation1[0].notes[0].sound, scale)).toBe(1);
    expect(getDegreeOfNote(variation2[0].notes[0].sound, scale)).toBe(1);

    const lastV1 = variation1[variation1.length - 1];
    const lastV2 = variation2[variation2.length - 1];
    expect(getDegreeOfNote(lastV1.notes[lastV1.notes.length - 1].sound, scale)).toBe(1);
    expect(getDegreeOfNote(lastV2.notes[lastV2.notes.length - 1].sound, scale)).toBe(1);

    // Both variations must satisfy meter sum of 4 in every measure
    for (let m = 0; m < song.length; m++) {
      const sum1 = variation1[m].notes.reduce((s, n) => s + n.duration, 0);
      const sum2 = variation2[m].notes.reduce((s, n) => s + n.duration, 0);
      expect(sum1).toBe(4);
      expect(sum2).toBe(4);
    }
  });
});
