const piano = new Tone.Sampler({
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
}, {
    'release': 1,
    'baseUrl': './salamander/'
}).toMaster();

var part = new Tone.Part(function (time, note, duration) {
    //the notes given as the second element in the array
    //will be passed in as the second argument
    piano.triggerAttackRelease(note, duration, time);
}, [
        // Compass 1
        [0, "G#3", '8n'], ["0:0.33", "C#4", '8n'], ["0:0.66", "E4", '8n'],
        ["0:1", "G#3", '8n'], ["0:1.33", "C#4", '8n'], ["0:1.66", "E4", '8n'],
        ["0:2", "G#3", '8n'], ["0:2.33", "C#4", '8n'], ["0:2.66", "E4", '8n'],
        ["0:3", "G#3", '8n'], ["0:3.33", "C#4", '8n'], ["0:3.66", "E4", '8n'],
        [0, 'C#3', '1m'], [0, 'C#2', '1m'],

        // Compass 2
        ["1:0", "G#3", '8n'], ["1:0.33", "C#4", '8n'], ["1:0.66", "E4", '8n'],
        ["1:1", "G#3", '8n'], ["1:1.33", "C#4", '8n'], ["1:1.66", "E4", '8n'],
        ["1:2", "G#3", '8n'], ["1:2.33", "C#4", '8n'], ["1:2.66", "E4", '8n'],
        ["1:3", "G#3", '8n'], ["1:3.33", "C#4", '8n'], ["1:3.66", "E4", '8n'],
        ["1:0", 'B1', '1m'], ["1:0", 'B2', '1m'],

        // Compass 3
        ["2:0", "A3", '8n'], ["2:0.33", "C#4", '8n'], ["2:0.66", "E4", '8n'],
        ["2:1", "A3", '8n'], ["2:1.33", "C#4", '8n'], ["2:1.66", "E4", '8n'],
        ["2:2", "A3", '8n'], ["2:2.33", "D4", '8n'], ["2:2.66", "F#4", '8n'],
        ["2:3", "A3", '8n'], ["2:3.33", "D4", '8n'], ["2:3.66", "F#4", '8n'],
        ["2:0", 'A1', '1m'], ["2:0", 'A2', '1m'], ["2:2", 'F#1', '1m'], ["2:2", 'F#2', '1m']
    ]);

    /*
		const POSSIBLE_TEMPOS = [
			NEGRA, BLANCA, REDONDA, CORCHEA, SEMICORCHEA, FUSA, CORCHEA_TRESSILLO,
			NEGRA_CON_PUNTILLO, BLANCA_CON_PUNTILLO, CORCHEA_CON_PUNTILLO, SEMICORCHEA_CON_PUNTILLO
		];
        */
        function generateMusic() {
			const numberOfNotes = 10;
			const song = [];
			for (let i = 0; i < numberOfNotes; i++) {
				song.push(["0:" + i, getRadomNote(), '1t']);
			}

			return song;
        }
        
        const SEMICORCHEA = CORCHEA / 2;
		const FUSA = SEMICORCHEA / 2;
		const CORCHEA_TRESSILLO = NEGRA / 3;
		const NEGRA_CON_PUNTILLO = NEGRA * 1.5;
		const BLANCA_CON_PUNTILLO = BLANCA * 1.5;
		const CORCHEA_CON_PUNTILLO = CORCHEA * 1.5;
        const SEMICORCHEA_CON_PUNTILLO = SEMICORCHEA * 1.5;
        const REDONDA = BLANCA * 2;

        const CMajorScale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
		const DMajorScale = ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];
        const GMajorScale = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'];
        

        generateMusicAndTempo(numberOfNotes) {
            const numberOfNotes = 100;
            const song = [];
            let currentTempo = 0;
            for (let i = 0; i < numberOfNotes; i++) {
                const tempo = this.getRandomTempo();
                currentTempo += tempo;
                song.push(["0:" + currentTempo, this.getRandomNote(), '1t']);
            }
            return song;
        }

        getRandomTempo() {
            const tempos = this.possibleTempos;
            let randomTempo = Math.floor(tempos.length - Math.random() * tempos.length);
            return tempos[randomTempo];
        }
    
        getRandomNote() {
            const notes = this.melodySeed;
            let randomNote = Math.floor(notes.length - Math.random() * notes.length);
            return notes[randomNote];
        }
    