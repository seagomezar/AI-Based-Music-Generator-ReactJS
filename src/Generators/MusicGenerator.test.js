import { describe, it, expect } from 'vitest';
import {
  generateSong,
  generateAllNotes,
  generateMusicAndTempo
} from './MusicGenerator';
import { CURRENT_SOUNDS, ALL_DURATIONS } from '../Constants';

describe('MusicGenerator', () => {
  it('generates a song with the specified number of measures', () => {
    const measuresCount = 4;
    const song = generateSong(measuresCount);

    expect(song).toHaveLength(measuresCount);
    song.forEach((measure, idx) => {
      expect(measure.position).toBe(idx + 1);
      expect(measure.notes.length).toBeGreaterThan(0);
      
      // Measure note durations should sum to 4 (4/4 time)
      const totalDuration = measure.notes.reduce((sum, n) => sum + n.duration, 0);
      expect(totalDuration).toBe(4);
    });
  });

  it('forces first and last notes to be tonic', () => {
    const song = generateSong(6);
    expect(song[0].notes[0].sound).toBe(0);
    const lastMeasure = song[song.length - 1];
    expect(lastMeasure.notes[lastMeasure.notes.length - 1].sound).toBe(0);
  });

  it('generates all standard notes', () => {
    const notes = generateAllNotes();
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0]).toBe('C1');
  });

  it('generates music and tempo events', () => {
    const duration = 8;
    const events = generateMusicAndTempo(duration, CURRENT_SOUNDS, ALL_DURATIONS);
    expect(events.length).toBeGreaterThan(0);
  });
});
