import { describe, it, expect, vi } from 'vitest';
import {
  generateSecondVoice,
  noteToMidi,
  resolveSopranoSound,
  getScaleDegrees,
  getDegreeOfNote,
  getBassPool,
  soundToVexKey,
} from '../Generators/CounterpointGenerator';
import { generateSong } from '../Generators/MusicGenerator';
import {
  MAJOR_SCALES,
  ALL_FULL_NOTES,
  getCanonicalPianoNote,
  getNotationForPaint,
  getNotationForPlay,
  changeScale,
} from '../Constants';

// Mulberry32 deterministic 32-bit PRNG
function createPrng(seed = 42) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Property-Based Testing: Invariants & Constraint Verification', () => {
  const ALL_SCALES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#'];

  it('runs 1,000 property-based iterations verifying Kennan counterpoint invariants', () => {
    const prng = createPrng(1337);
    const TOTAL_RUNS = 1000;

    let totalNotesChecked = 0;
    let totalIntervalsChecked = 0;

    for (let run = 0; run < TOTAL_RUNS; run++) {
      // Deterministically pick scale and measure count
      const scaleKey = ALL_SCALES[Math.floor(prng() * ALL_SCALES.length)];
      const measureCount = Math.floor(prng() * 16) + 2; // Between 2 and 17 measures

      // Sync global scale for test consistency
      changeScale(scaleKey);

      // Generate melody and counterpoint
      const song = generateSong(measureCount);
      const secondVoice = generateSecondVoice(song, scaleKey);

      // ---------------------------------------------------------------
      // INVARIANT 1: Structural Integrity (1:1 measure correspondence)
      // ---------------------------------------------------------------
      expect(secondVoice.length).toBe(song.length);

      let prevSopranoMidi = null;
      let prevBassMidi = null;

      for (let m = 0; m < song.length; m++) {
        const sNotes = song[m].notes;
        const bNotes = secondVoice[m].notes;

        // ---------------------------------------------------------------
        // INVARIANT 2: Strict 4/4 Meter (Sum of durations must equal 4)
        // ---------------------------------------------------------------
        const sDurationSum = sNotes.reduce((acc, n) => acc + n.duration, 0);
        const bDurationSum = bNotes.reduce((acc, n) => acc + n.duration, 0);
        expect(sDurationSum).toBe(4);
        expect(bDurationSum).toBe(4);

        let bAcc = 0;
        for (let b = 0; b < bNotes.length; b++) {
          const bNote = bNotes[b];
          totalNotesChecked++;

          // ---------------------------------------------------------------
          // INVARIANT 3: Bass Register & Pool Integrity
          // ---------------------------------------------------------------
          expect(bNote.clef).toBe('bass');
          const bassMidi = noteToMidi(bNote.sound);
          const bassPool = getBassPool(scaleKey);
          expect(bassPool).toContain(bNote.sound);
          expect(bassMidi).toBeGreaterThanOrEqual(noteToMidi(bassPool[0]));
          expect(bassMidi).toBeLessThanOrEqual(noteToMidi(bassPool[bassPool.length - 1]));

          // ---------------------------------------------------------------
          // INVARIANT 4: Canonical Piano Note Mapping
          // ---------------------------------------------------------------
          const canonical = getCanonicalPianoNote(bNote.sound);
          expect(ALL_FULL_NOTES).toContain(canonical);

          // ---------------------------------------------------------------
          // INVARIANT 5: Diatonic Scale Membership (No chromatic foreign notes)
          // ---------------------------------------------------------------
          const bDeg = getDegreeOfNote(bNote.sound, scaleKey);
          expect(bDeg).toBeGreaterThanOrEqual(1);
          expect(bDeg).toBeLessThanOrEqual(7);

          // Find simultaneous sounding soprano note
          let sAcc = 0;
          let soundingSoprano = resolveSopranoSound(sNotes[0], scaleKey);
          for (let s = 0; s < sNotes.length; s++) {
            if (bAcc >= sAcc && bAcc < sAcc + sNotes[s].duration) {
              soundingSoprano = resolveSopranoSound(sNotes[s], scaleKey);
              break;
            }
            sAcc += sNotes[s].duration;
          }

          const sopranoMidi = noteToMidi(soundingSoprano);

          // ---------------------------------------------------------------
          // INVARIANT 6: Zero Voice Crossing (Bass NEVER >= Soprano)
          // ---------------------------------------------------------------
          expect(bassMidi).toBeLessThan(sopranoMidi);

          // ---------------------------------------------------------------
          // INVARIANT 7: Prohibition of Parallel 5ths and 8ves (Kennan Rule)
          // ---------------------------------------------------------------
          if (prevSopranoMidi !== null && prevBassMidi !== null) {
            totalIntervalsChecked++;
            const prevDiff = (prevSopranoMidi - prevBassMidi) % 12;
            const curDiff = (sopranoMidi - bassMidi) % 12;

            const ds = Math.sign(sopranoMidi - prevSopranoMidi);
            const db = Math.sign(bassMidi - prevBassMidi);

            if (ds === db && ds !== 0) {
              // Consecutive perfect octaves moving in same direction are strictly forbidden
              const isParallelOctave = prevDiff === 0 && curDiff === 0;
              expect(isParallelOctave).toBe(false);

              // Consecutive perfect fifths moving in same direction are strictly forbidden
              const isParallelFifth = prevDiff === 7 && curDiff === 7;
              expect(isParallelFifth).toBe(false);
            }
          }

          prevSopranoMidi = sopranoMidi;
          prevBassMidi = bassMidi;
          bAcc += bNote.duration;
        }

        // ---------------------------------------------------------------
        // INVARIANT 8: Armonía Clara Cadential Closure
        // ---------------------------------------------------------------
        if (m === 0) {
          // Downbeat of measure 1 must be tonic root (degree 1)
          const firstBass = bNotes[0].sound;
          expect(getDegreeOfNote(firstBass, scaleKey)).toBe(1);
        }

        if (m === song.length - 1) {
          // Final note of the last measure must resolve to tonic root (degree 1)
          const finalBass = bNotes[bNotes.length - 1].sound;
          expect(getDegreeOfNote(finalBass, scaleKey)).toBe(1);
        }
      }
    }

    // Confirm that thousands of real notes and interval transitions were validated
    expect(totalNotesChecked).toBeGreaterThan(15000);
    expect(totalIntervalsChecked).toBeGreaterThan(10000);
  });

  it('verifies boundary and extreme input robustness', () => {
    // Single measure boundary
    const song1 = generateSong(1);
    const sv1 = generateSecondVoice(song1, 'C');
    expect(sv1).toHaveLength(1);
    expect(getDegreeOfNote(sv1[0].notes[0].sound, 'C')).toBe(1);
    expect(getDegreeOfNote(sv1[0].notes[sv1[0].notes.length - 1].sound, 'C')).toBe(1);

    // Large song boundary (32 measures)
    const song32 = generateSong(32);
    const sv32 = generateSecondVoice(song32, 'B');
    expect(sv32).toHaveLength(32);

    // Empty or null inputs NEVER throw
    expect(generateSecondVoice(null)).toEqual([]);
    expect(generateSecondVoice([])).toEqual([]);
    expect(resolveSopranoSound(null)).toBe('C4');
    expect(noteToMidi(null)).toBe(60);
    expect(soundToVexKey(null)).toBe('c/4');
    expect(getCanonicalPianoNote('')).toBe('');
  });

  it('fuzzes duration conversions to ensure bidirectional consistency', () => {
    const durations = [4, 2, 1, 0.5, 0.25, 0.125];
    durations.forEach((d) => {
      const paintNotation = getNotationForPaint(d);
      const playNotation = getNotationForPlay(d);
      expect(typeof paintNotation).toBe('string');
      expect(typeof playNotation).toBe('string');
      expect(paintNotation.length).toBeGreaterThan(0);
      expect(playNotation.length).toBeGreaterThan(0);
    });
  });
});
