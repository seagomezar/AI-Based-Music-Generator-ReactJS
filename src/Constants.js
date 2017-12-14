export const SALAMANDER_PIANO_SOUNDS = {
    'A0': 'A0.[mp3|ogg]',
    'C1': 'C1.[mp3|ogg]',
    'D#1': 'Ds1.[mp3|ogg]',
    'F#1': 'Fs1.[mp3|ogg]',
    'A1': 'A1.[mp3|ogg]',
    'C2': 'C2.[mp3|ogg]',
    'D#2': 'Ds2.[mp3|ogg]',
    'F#2': 'Fs2.[mp3|ogg]',
    'A2': 'A2.[mp3|ogg]',
    'C3': 'C3.[mp3|ogg]',
    'D#3': 'Ds3.[mp3|ogg]',
    'F#3': 'Fs3.[mp3|ogg]',
    'A3': 'A3.[mp3|ogg]',
    'C4': 'C4.[mp3|ogg]',
    'D#4': 'Ds4.[mp3|ogg]',
    'F#4': 'Fs4.[mp3|ogg]',
    'A4': 'A4.[mp3|ogg]',
    'C5': 'C5.[mp3|ogg]',
    'D#5': 'Ds5.[mp3|ogg]',
    'F#5': 'Fs5.[mp3|ogg]',
    'A5': 'A5.[mp3|ogg]',
    'C6': 'C6.[mp3|ogg]',
    'D#6': 'Ds6.[mp3|ogg]',
    'F#6': 'Fs6.[mp3|ogg]',
    'A6': 'A6.[mp3|ogg]',
    'C7': 'C7.[mp3|ogg]',
    'D#7': 'Ds7.[mp3|ogg]',
    'F#7': 'Fs7.[mp3|ogg]',
    'A7': 'A7.[mp3|ogg]',
    'C8': 'C8.[mp3|ogg]'
};
export const ALL_NATURAL_NOTES = [ 
    // "C1", "D1", "E1", "F1", "G1", "A1", "B1", 
    // "C2", "D2", "E2", "F2", "G2", "A2", "B2", 
    // "C3", "D3", "E3", "F3", "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    // "C6", "D6", "E6", "F6", "G6", "A6", "B6", 
    // "C7" 
];

export const ALL_FULL_NOTES = [ 
    "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1", 
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", 
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", 
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", 
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5", 
    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6", 
    "C7" 
];

export const MAJOR_SCALES = {
    "C": ["C1", "D1", "E1", "F1", "G1", "A1", "B1", "C2"],
    "D": ["D1", "E1", "F#1", "G1", "A1", "B1", "C#2", "D2"],
    "E": ["E1", "F#1", "G#1", "A1", "B1", "C#2", "D#2", "E2"],
    "F": ["F1", "G1", "A1", "A#1", "C2", "D2", "E2", "F2"],
    "G": ["G1", "A1", "B1", "C2", "D2", "E2", "F#2", "G2"],
    "A": ["A1", "B1", "C#2", "D2", "E2", "F#2", "G#2", "A2"],
    "B": ["B1", "C#2", "D#2", "E2", "F#2", "G#2", "A#2", "B2"],
    "F#" : ["F#1", "G#1", "A#1", "C#2", "D#2", "E#2", "F2"],
};

export const NICE_SONGS = [
    ['B3', 'C#4', 'D#4', 'E4', 'F#4', 'A4', 'B4',
    'C#4', 'D#5', 'E5', 'F#5', 'G#4', 'A5', 'B5',
    'C#6', 'D#6', 'E6'],
    ['B3', 'C4', 'D4', 'E4', 'F4', 'A4', 'B4',
    'C4', 'D5', 'E5', 'F5', 'G4', 'A5', 'B5',
    'C6', 'D6', 'E6'] 
];

function setScale(scale, octave) {
    let setOfNotes = scale.map(e => {
        return e.replace("2", octave+1).replace("1", octave);
    });
    console.log(setOfNotes);
    return setOfNotes;
}

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

export const CURRENT_SCALE = pickRandomProperty(MAJOR_SCALES);

export const CURRENT_SOUNDS = setScale(MAJOR_SCALES[CURRENT_SCALE], 4);

export const ALL_DURATIONS = [
    2, 
    // 4, 
    1, 
    0.5, 
    // 0.25
];

export const MAX_RADIUS = 40;
export const MIN_RADIUS = 10;
export const MAX_SPEED = 220;
export const MIN_SPEED = 40;
export const HEIGHT = window.innerHeight - 5;
export const WIDTH = window.innerWidth -15;

export function getNotationForPaint(duration) {
    switch (duration) {
        case 4:
            return 'w';
        case 2:
            return 'h';
        case 1:
            return 'q';
        case 0.5:
            return '8';
        case 0.25:
            return '16';
        case 0.125:
            return '32';
        default:
            break;
    }
}

export function getNotationForPlay(duration) {
    switch (duration) {
        case 4:
            return '1m';
        case 2:
            return '2n';
        case 1:
            return '4n';
        case 0.5:
            return '8t';
        case 0.25:
            return '16t';
        case 0.125:
            return '32t';
        default:
            break;
    }
};
