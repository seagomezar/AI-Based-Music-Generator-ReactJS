// DATA STRUCTURES DESCRIPTION //
/** @class Note
* class Note {
*     measure: number;
*     sound: number;
*     duration: number;
*     position: number;
*     accidental: boolean;
* };
*/

/** @class Measure
* class Measure {
*    position: number,
*    notes: Note[]
* };
*/

/** @class Song
 * class Song {
 *   title: string,
 *   measures: Measure[],
 *   bpm: number 
 * } 
 */
// DATA STRUCTURES DESCRIPTION //

import { CURRENT_SOUNDS, ALL_DURATIONS } from "../Constants";

/** 
 * @function isValidMeasure(@argument Measure) @returns boolean 
 * This is an utilitary function to determine if the measure is valid or no.

function isValidMeasure(measure) {
  let acumulatedTime = 0;
  measure.notes.forEach((n) => {
    acumulatedTime += n.duration; 
  })
  return acumulatedTime === measure.meter.numerator;
}*/

/** 
 * @function getRandomSound(@argument setOfSounds: string[]) @returns string 
 * This function returns a random note from a set of notes.
 */
function getRandomSound(setOfSounds) {
  const randomNote = Math.floor(setOfSounds.length - Math.random() * setOfSounds.length);
  return { index: randomNote, sound: setOfSounds[randomNote] };
}

/** 
 * @function getRandomDuration(
 *  @argument setOfDurations: number[], @argument availableDuration: number
 * ) @returns number 
 * This function returns a random duration from a set of durations if is less
 * or equal to availableDuration.
 */
/** 
 * @function getRandomDuration(
 *  @argument setOfDurations: number[], @argument availableDuration: number
 * ) @returns number 
 * This function returns a random duration from a set of durations, 
 * weighted to favor quarter notes, if it fits in availableDuration.
 */
function getRandomDuration(setOfDurations, availableDuration) {
  // 1. Force Beat Closure (Anti-Syncopation)
  // If we are "off-beat" (availableDuration is not an integer), we MUST pick 0.5 to close the beat.
  // This ensures eighth notes always come in pairs (or complete a beat), avoiding "hanging" off-beats.
  if (availableDuration % 1 !== 0) {
    return 0.5;
  }

  // 2. Filter valid durations (Standard logic)
  const validDurations = setOfDurations.filter(d => d <= availableDuration);

  if (validDurations.length === 0) return 0.5;
  if (validDurations.length === 1) return validDurations[0];

  // 3. Define Weights (Favor "Straight" Rhythms)
  // drastically reduced probability of starting a split beat (0.5) to reduce syncopation
  const weights = {
    2: 0.30,   // Half note: 30% (More stable long notes)
    1: 0.60,   // Quarter note: 60% (The main pulse)
    0.5: 0.10  // Eighth note: 10% (Occasional flourish, but always paired due to rule #1)
  };

  // 4. Build a weighted pool
  let pool = [];
  validDurations.forEach(duration => {
    const weight = weights[duration] || 0.1;
    const count = Math.floor(weight * 100);
    for (let i = 0; i < count; i++) {
      pool.push(duration);
    }
  });

  // 5. Pick random from pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/** 
 * @function getNextNoteIndex(@argument currentIndex: number, @argument maxIndex: number, @argument secondLastIndex: number) @returns number 
 * Returns a new note index favoring stepwise motion and preventing 3 consecutive identical notes.
 */
function getNextNoteIndex(currentIndex, maxIndex, secondLastIndex) {
  if (currentIndex === null || currentIndex === undefined) {
    return Math.floor(Math.random() * maxIndex);
  }

  const r = Math.random();
  let step;

  if (r < 0.45) { // 45% chance: +/- 1 step (Stepwise)
    step = Math.random() < 0.5 ? 1 : -1;
  } else if (r < 0.70) { // 25% chance: +/- 2 steps (Skip)
    step = Math.random() < 0.5 ? 2 : -2;
  } else if (r < 0.85) { // 15% chance: Same note
    step = 0;
  } else { // 15% chance: Random jump
    return Math.floor(Math.random() * maxIndex);
  }

  let newIndex = currentIndex + step;

  // Prevent 3 consecutive identical notes
  if (currentIndex === secondLastIndex && newIndex === currentIndex) {
    // Force a step away if we are about to repeat for the 3rd time
    const avoidanceStep = Math.random() < 0.5 ? 1 : -1;
    newIndex = currentIndex + avoidanceStep;
  }

  // Clamp to valid range
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= maxIndex) newIndex = maxIndex - 1;

  return newIndex;
}

/** 
 * @function generateNote(@argument availableDuration: number, @argument previousNoteIndex: number, @argument secondLastIndex: number) @returns Note 
 * This function returns a Note with a duration less or equal to available duration, 
 * selecting a sound based on the previous notes history.
 */
function generateNote(availableDuration, previousNoteIndex, secondLastIndex) {
  const soundIndex = getNextNoteIndex(previousNoteIndex, CURRENT_SOUNDS.length, secondLastIndex);
  const sound = CURRENT_SOUNDS[soundIndex];

  return {
    sound: soundIndex,
    duration: getRandomDuration(ALL_DURATIONS, availableDuration),
    position: null,
    accidental: Boolean(~sound.indexOf('#'))
  }
}

/** 
 * @function generateMeasure(@argument meter: Object, @argument lastNoteIndex: number, @argument secondLastNoteIndex: number, @argument forceFirstNoteIndex: number) @returns Measure 
 * This function returns a random Measure with an specific meter,
 * @argument meter is an object i.e {numerator: 4, denominator: 4}
 */
function generateMeasure(meter, lastNoteIndex, secondLastNoteIndex, forceFirstNoteIndex = null) {
  const measure = {
    position: 1,
    notes: []
  };
  let currentDuration = 0;
  let iteration = 1;
  let currentNoteIndex = lastNoteIndex;
  let prevNoteIndex = secondLastNoteIndex;

  while (currentDuration < meter.numerator) {
    let note;

    // Force the first note if requested (only on the very first iteration of the measure)
    if (iteration === 1 && forceFirstNoteIndex !== null) {
      // Create the forced note note manually or generate and override
      const soundIndex = forceFirstNoteIndex;
      const sound = CURRENT_SOUNDS[soundIndex];
      note = {
        sound: soundIndex,
        duration: getRandomDuration(ALL_DURATIONS, meter.numerator - currentDuration), // Standard duration logic
        position: null,
        accidental: Boolean(~sound.indexOf('#'))
      };
    } else {
      note = generateNote(meter.numerator - currentDuration, currentNoteIndex, prevNoteIndex);
    }

    currentDuration += note.duration;
    note.position = iteration;
    measure.notes.push(note);

    // Update history
    prevNoteIndex = currentNoteIndex;
    currentNoteIndex = note.sound;

    iteration++;
  }
  return measure;
}

/** 
 * @function generateSong(@argument maxMeasures: number) @returns Song 
 * This function returns a random Sing with an specificNumber of measures.
 */
export function generateSong(maxMeasures) {
  let song = [];
  let meter = { numerator: 4, denominator: 4 }
  let lastNoteIndex = Math.floor(CURRENT_SOUNDS.length / 2); // Start in the middle range
  let secondLastNoteIndex = null;

  for (let i = 1; i <= maxMeasures; i++) {
    // Force the first note of the entire song to be the Tonic (index 0)
    const forceFirst = (i === 1) ? 0 : null;

    const measure = generateMeasure(meter, lastNoteIndex, secondLastNoteIndex, forceFirst);
    measure.position = i;

    // Update indices from the generated measure
    if (measure.notes.length > 0) {
      if (measure.notes.length >= 2) {
        secondLastNoteIndex = measure.notes[measure.notes.length - 2].sound;
        lastNoteIndex = measure.notes[measure.notes.length - 1].sound;
      } else {
        secondLastNoteIndex = lastNoteIndex;
        lastNoteIndex = measure.notes[0].sound;
      }
    }

    song.push(measure);
  }

  // Force the LAST note of the song to be the Tonic (Resolving the melody)
  // We use index 0 (Low Tonic) or 7 (High Tonic) depending on what's closer, but 0 is safer for "Home".
  // Let's just use 0 (Root) for a strong resolution.
  if (song.length > 0) {
    const lastMeasure = song[song.length - 1];
    if (lastMeasure.notes.length > 0) {
      const lastNote = lastMeasure.notes[lastMeasure.notes.length - 1];
      lastNote.sound = 0; // Force Tonic
      // Re-calculate information based on new sound
      const soundStr = CURRENT_SOUNDS[0];
      lastNote.accidental = Boolean(~soundStr.indexOf('#'));
    }
  }

  return song;
};

export function generateAllNotes() {
  const noteLetters = ['C', 'C#', 'D', 'D#', 'E', 'E#', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B', 'B#'];
  const lastScale = 7;
  const notes = [];
  let i = 0;
  let currentScale = 1;
  let currentNote;
  while (currentNote !== 'C' + lastScale) {
    currentNote = noteLetters[i] + currentScale;
    notes.push(currentNote);
    if (noteLetters[i] === 'B#') {
      currentScale++;
      i = 0;
    } else {
      i++;
    }
  }
  return notes;
};

export function generateMusicAndTempo(duration, posibleNotes, possibleFigures) {
  const song = [];
  let currentTempo = 0;
  while (currentTempo < duration) {
    const tempo = getRandomFigure(ALL_DURATIONS);
    let figure = '1q';
    currentTempo += tempo;
    song.push(["0:" + currentTempo, getRandomNote(CURRENT_SOUNDS), figure]);
  }
  return song;
}

function getRandomFigure(possibleFigures) {
  let randomTempo = Math.floor(possibleFigures.length - Math.random() * possibleFigures.length);
  return possibleFigures[randomTempo];
}

function getRandomNote(posibleNotes) {
  let randomNote = Math.floor(posibleNotes.length - Math.random() * posibleNotes.length);
  return posibleNotes[randomNote];
}



