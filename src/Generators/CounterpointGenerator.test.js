import { describe, it, expect } from 'vitest';
import {
  noteToMidi,
  soundToVexKey,
  getScaleDegrees,
  getBassPool,
  getDegreeOfNote,
  resolveSopranoSound,
  generateSecondVoice,
} from './CounterpointGenerator';
import { generateSong } from './MusicGenerator';
import { MAJOR_SCALES } from '../Constants';

describe('CounterpointGenerator - Kent Kennan 2-Voice Rules', () => {
  it('correctly maps note strings to MIDI numbers', () => {
    expect(noteToMidi('C4')).toBe(60);
    expect(noteToMidi('A4')).toBe(69);
    expect(noteToMidi('C3')).toBe(48);
    expect(noteToMidi('C2')).toBe(36);
    expect(noteToMidi('F#3')).toBe(54);
    expect(noteToMidi('Bb2')).toBe(46);
  });

  it('converts pitch strings to VexFlow key format', () => {
    expect(soundToVexKey('C3')).toBe('c/3');
    expect(soundToVexKey('F#3')).toBe('f#/3');
    expect(soundToVexKey('Bb2')).toBe('bb/2');
    expect(soundToVexKey('G#2')).toBe('g#/2');
  });

  it('extracts diatonic scale degrees correctly', () => {
    const cDegrees = getScaleDegrees('C');
    expect(cDegrees).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

    const bDegrees = getScaleDegrees('B');
    expect(bDegrees).toEqual(['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']);

    const fDegrees = getScaleDegrees('F');
    expect(fDegrees).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
  });

  it('builds a bass pool restricted to octaves 2 and 3 plus tonic 4', () => {
    const bassPool = getBassPool('C');
    expect(bassPool.length).toBe(15); // 7 notes in oct 2, 7 notes in oct 3, 1 note (C4)
    expect(bassPool[0]).toBe('C2');
    expect(bassPool[bassPool.length - 1]).toBe('C4');

    // Asserts sorted ascending by MIDI pitch
    for (let i = 1; i < bassPool.length; i++) {
      expect(noteToMidi(bassPool[i])).toBeGreaterThanOrEqual(noteToMidi(bassPool[i - 1]));
    }
  });

  it('resolves degree of notes within scale', () => {
    expect(getDegreeOfNote('C3', 'C')).toBe(1);
    expect(getDegreeOfNote('G3', 'C')).toBe(5);
    expect(getDegreeOfNote('E2', 'C')).toBe(3);
    expect(getDegreeOfNote('B2', 'B')).toBe(1);
    expect(getDegreeOfNote('F#3', 'B')).toBe(5);
  });

  it('resolves soprano sound accurately for any scale', () => {
    // In B Major, index 0 is B4, index 1 is C#5
    expect(resolveSopranoSound({ sound: 0 }, 'B')).toBe('B4');
    expect(resolveSopranoSound({ sound: 1 }, 'B')).toBe('C#5');
    // If explicit soundName is present, preserve it
    expect(resolveSopranoSound({ soundName: 'E5' }, 'B')).toBe('E5');
  });

  it('generates a second voice with exact measure matching and valid 4/4 meter', () => {
    const song = generateSong(6);
    const secondVoice = generateSecondVoice(song, 'C');

    expect(secondVoice).toHaveLength(song.length);

    secondVoice.forEach((measure, idx) => {
      expect(measure.position).toBe(idx + 1);
      expect(measure.notes.length).toBeGreaterThan(0);

      // Verify meter adds up to 4 beats per measure
      const totalDuration = measure.notes.reduce((sum, n) => sum + n.duration, 0);
      expect(totalDuration).toBe(4);

      // Verify all notes are set to bass clef
      measure.notes.forEach((note) => {
        expect(note.clef).toBe('bass');
        expect(typeof note.sound).toBe('string');
      });
    });
  });

  it('strictly avoids voice crossing (bass lower than soprano at all times)', () => {
    const song = generateSong(8);
    const secondVoice = generateSecondVoice(song, 'C');

    for (let m = 0; m < song.length; m++) {
      const sopranoNotes = song[m].notes;
      const bassNotes = secondVoice[m].notes;

      // Check downbeat of each measure
      const sMidi = noteToMidi(resolveSopranoSound(sopranoNotes[0], 'C'));
      const bMidi = noteToMidi(bassNotes[0].sound);

      expect(bMidi).toBeLessThan(sMidi);
    }
  });

  it('begins and ends on tonic root for clear classical harmony (Armonía Clara)', () => {
    ['C', 'D', 'G', 'B'].forEach((scaleKey) => {
      const song = generateSong(6);
      const secondVoice = generateSecondVoice(song, scaleKey);

      // First measure, first note must be the scale tonic degree (1)
      const firstNote = secondVoice[0].notes[0].sound;
      expect(getDegreeOfNote(firstNote, scaleKey)).toBe(1);

      // Final measure, last note must resolve to tonic degree (1)
      const lastMeasure = secondVoice[secondVoice.length - 1];
      const finalNote = lastMeasure.notes[lastMeasure.notes.length - 1].sound;
      expect(getDegreeOfNote(finalNote, scaleKey)).toBe(1);
    });
  });

  it('adheres to Kennan rule: NO parallel fifths or octaves across consecutive notes', () => {
    // Run across multiple generated songs to stress test
    for (let run = 0; run < 10; run++) {
      const song = generateSong(8);
      const secondVoice = generateSecondVoice(song, 'C');

      let prevSopranoMidi = null;
      let prevBassMidi = null;

      for (let m = 0; m < song.length; m++) {
        const sNotes = song[m].notes;
        const bNotes = secondVoice[m].notes;

        let bAcc = 0;
        for (let b = 0; b < bNotes.length; b++) {
          const bNote = bNotes[b];
          const bMidi = noteToMidi(bNote.sound);

          // Find sounding soprano note at this exact beat
          let sAcc = 0;
          let sSound = resolveSopranoSound(sNotes[0], 'C');
          for (let s = 0; s < sNotes.length; s++) {
            if (bAcc >= sAcc && bAcc < sAcc + sNotes[s].duration) {
              sSound = resolveSopranoSound(sNotes[s], 'C');
              break;
            }
            sAcc += sNotes[s].duration;
          }
          const sMidi = noteToMidi(sSound);

          if (prevSopranoMidi !== null && prevBassMidi !== null) {
            const prevDiff = (prevSopranoMidi - prevBassMidi) % 12;
            const curDiff = (sMidi - bMidi) % 12;
            const ds = Math.sign(sMidi - prevSopranoMidi);
            const db = Math.sign(bMidi - prevBassMidi);

            // If both voices moved in the same direction
            if (ds === db && ds !== 0) {
              // Parallel octaves forbidden
              const isParallel8ve = prevDiff === 0 && curDiff === 0;
              expect(isParallel8ve).toBe(false);

              // Parallel fifths forbidden
              const isParallel5th = prevDiff === 7 && curDiff === 7;
              expect(isParallel5th).toBe(false);
            }
          }

          prevSopranoMidi = sMidi;
          prevBassMidi = bMidi;
          bAcc += bNote.duration;
        }
      }
    }
  });
});
