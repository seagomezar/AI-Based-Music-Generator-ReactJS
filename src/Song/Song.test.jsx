import { describe, it, expect } from 'vitest';
import { soundToVexKey } from './Song';
import { Voice, StaveNote, Accidental } from 'vexflow';
import { MAJOR_SCALES, getCanonicalPianoNote } from '../Constants';

describe('Song notation and accidentals handling', () => {
  it('converts sound strings to standard VexFlow pitch format', () => {
    expect(soundToVexKey('C#5')).toBe('c#/5');
    expect(soundToVexKey('D4')).toBe('d/4');
    expect(soundToVexKey('Bb4')).toBe('bb/4');
    expect(soundToVexKey('F#4')).toBe('f#/4');
    expect(soundToVexKey('B4')).toBe('b/4');
  });

  it('does NOT add redundant sharp accidentals to notes in B Major', () => {
    // In B Major (5 sharps: F#, C#, G#, D#, A#), diatonic notes must NOT have accidental glyphs
    const bMajorNotes = ['b/4', 'c#/5', 'd#/5', 'e/5', 'f#/5', 'g#/5', 'a#/5', 'b/5'].map(
      (key) => new StaveNote({ keys: [key], duration: 'q' })
    );

    const voice = new Voice({ num_beats: 8, beat_value: 4 }).setMode(Voice.Mode.SOFT);
    voice.addTickables(bMajorNotes);
    Accidental.applyAccidentals([voice], 'B');

    bMajorNotes.forEach((note, idx) => {
      expect(note.getModifiers()).toHaveLength(0);
    });
  });

  it('correctly applies accidental only when note deviates from key signature', () => {
    // In B Major, C natural is an alteration and should receive a natural sign
    const notes = [
      new StaveNote({ keys: ['b/4'], duration: 'q' }),
      new StaveNote({ keys: ['c/5'], duration: 'q' }),
    ];

    const voice = new Voice({ num_beats: 2, beat_value: 4 }).setMode(Voice.Mode.SOFT);
    voice.addTickables(notes);
    Accidental.applyAccidentals([voice], 'B');

    expect(notes[0].getModifiers()).toHaveLength(0);
    expect(notes[1].getModifiers()).toHaveLength(1);
    expect(notes[1].getModifiers()[0].type).toBe('n');
  });

  it('does not add redundant accidentals for other major scales (e.g. D, E, A, F)', () => {
    const scalesToTest = [
      { key: 'D', notes: ['d/4', 'e/4', 'f#/4', 'g/4', 'a/4', 'b/4', 'c#/5', 'd/5'] },
      { key: 'E', notes: ['e/4', 'f#/4', 'g#/4', 'a/4', 'b/4', 'c#/5', 'd#/5', 'e/5'] },
      { key: 'A', notes: ['a/4', 'b/4', 'c#/5', 'd/5', 'e/5', 'f#/5', 'g#/5', 'a/5'] },
      { key: 'F', notes: ['f/4', 'g/4', 'a/4', 'bb/4', 'c/5', 'd/5', 'e/5', 'f/5'] },
    ];

    scalesToTest.forEach(({ key, notes }) => {
      const staveNotes = notes.map((k) => new StaveNote({ keys: [k], duration: 'q' }));
      const voice = new Voice({ num_beats: 8, beat_value: 4 }).setMode(Voice.Mode.SOFT);
      voice.addTickables(staveNotes);
      Accidental.applyAccidentals([voice], key);

      staveNotes.forEach((n) => {
        expect(n.getModifiers()).toHaveLength(0);
      });
    });
  });

  it('verifies all MAJOR_SCALES contain exactly 8 diatonic notes', () => {
    Object.entries(MAJOR_SCALES).forEach(([scaleName, notes]) => {
      expect(notes).toHaveLength(8);
    });
    // F Major 4th degree must be Bb
    expect(MAJOR_SCALES['F'][3]).toBe('Bb1');
    // F# Major must contain B1
    expect(MAJOR_SCALES['F#'][3]).toBe('B1');
  });

  it('maps enharmonics for piano visualizer correctly', () => {
    expect(getCanonicalPianoNote('Bb4')).toBe('A#4');
    expect(getCanonicalPianoNote('E#5')).toBe('F5');
    expect(getCanonicalPianoNote('C4')).toBe('C4');
  });
});
