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

import {NICE_SONGS, ALL_DURATIONS} from "../Constants";

/** 
 * @function isValidMeasure(@argument Measure) @returns boolean 
 * This is an utilitary function to determine if the measure is valid or no.
 */
function isValidMeasure(measure) {
  let acumulatedTime = 0;
  measure.notes.forEach((n) => {
    acumulatedTime += n.duration; 
  })
  return acumulatedTime === measure.meter.numerator;
}

/** 
 * @function getRandomSound(@argument setOfSounds: string[]) @returns string 
 * This function returns a random note from a set of notes.
 */
function getRandomSound(setOfSounds) {
  const randomNote = Math.floor(setOfSounds.length - Math.random() * setOfSounds.length);
  return randomNote;
}

/** 
 * @function getRandomDuration(
 *  @argument setOfDurations: number[], @argument availableDuration: number
 * ) @returns number 
 * This function returns a random duration from a set of durations if is less
 * or equal to availableDuration.
 */
function getRandomDuration(setOfDurations, availableDuration) {
  let randomDuration = Infinity;
  while (randomDuration > availableDuration) {
    let randomIndex = Math.floor(setOfDurations.length - Math.random() * setOfDurations.length);
    randomDuration = setOfDurations[randomIndex];
  }
  return randomDuration;
}

/** 
 * @function generateNote(@argument availableDuration: number) @returns Note 
 * This function returns a random Note with a duration less or equal to available duration
 */
function generateNote(availableDuration) {
  return {
    sound: getRandomSound(NICE_SONGS[1]),
    duration: getRandomDuration(ALL_DURATIONS, availableDuration),
    position: null,
    accidental: Boolean(Math.random() >= 0.5)
  }
}

/** 
 * @function generateMeasure(@argument meter: Object) @returns Measure 
 * This function returns a random Measure with an specific meter,
 * @argument meter is an object i.e {numerator: 4, denominator: 4}
 */
function generateMeasure(meter) {
  const measure = {
    position: 1,
    notes: []
  };
  let currentDuration = 0;
  let iteration = 1;
  while (currentDuration < meter.numerator) {
    const note = generateNote(meter.numerator - currentDuration);
    currentDuration += note.duration;
    note.position = iteration;
    measure.notes.push(note);
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
  for (let i = 1; i <= maxMeasures; i++) {
    const measure = generateMeasure(meter);
    measure.position = i;
    song.push(measure);
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
    song.push(["0:" + currentTempo, getRandomNote(NICE_SONGS[0]), figure]);
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



