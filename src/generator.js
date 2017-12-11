/*
const allNotes = [ 
    "C1", "D1", "E1", "F1", "G1", "A1", "B1", 
    "C2", "D2", "E2", "F2", "G2", "A2", "B2", 
    "C3", "D3", "E3", "F3", "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6", "D6", "E6", "F6", "G6", "A6", "B6", 
    "C7" 
  ];
  */

  const allNotes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5",
  ];
  
  const allDurations = [
   2, 4, 1, 0.5, 0.25, 0.125
  ];
  
  /**
  * Data structure for a note
  const note = {
    measure: 1,
    sound: 2,
    duration: 1,
    position: 1,
    accidental: false
  };
  */
  
  /**
  * Data structure for a measure
  const measure1 = {
     position: 1,
     notes: [note, note, note, note],
     meter: {
       numerator: 4,
       denominator: 4
     }
  };
  */
  
  /**
  Utilitary function to determine if the measure is valid or no
  function isValidMeasure(measure) {
    let acumulatedTime = 0;
    measure.notes.forEach((n) => {
      acumulatedTime += n.duration; 
    })
    return acumulatedTime === measure.meter.numerator;
  }
  */
  
  function getRandomSound(setOfNotes) {
    let randomNote = Math.floor(setOfNotes.length - Math.random() * setOfNotes.length);
    return randomNote;
  }
  
  function getRandomDuration(setOfDurations, availableDuration) {
    let currentDuration = Infinity;
    while (currentDuration > availableDuration) {
       let randomIndex = Math.floor(setOfDurations.length - Math.random() * setOfDurations.length);
       currentDuration = setOfDurations[randomIndex];
    }
    return currentDuration;
  }
  
  function generateNote(availableDuration) {
     return {
       sound: getRandomSound(allNotes),
       duration: getRandomDuration(allDurations,availableDuration),
       position: null,
       accidental: Boolean(Math.random() >= 0.5)
     }
  }
  
  function generateMeasure(meter) {
    const measure = {
      position: 1,
       notes: []
    };
    let currentDuration = 0;
    let iteration = 1;
    while(currentDuration < meter.numerator) {
          const note = generateNote(meter.numerator-currentDuration);
          currentDuration += note.duration;
          note.position = iteration;
          measure.notes.push(note);
          iteration ++;
    }
    return measure;
  }
  
  function generateSong(measuresNumber) {
    let song = [];
    let meter = {numerator: 4, denominator: 4}
    for (let i = 1; i<= measuresNumber; i++) {
      const measure = generateMeasure(meter);
      measure.position = i;
      song.push(measure);
    }
    return song;
  }

  
export default generateSong;
  
  
  