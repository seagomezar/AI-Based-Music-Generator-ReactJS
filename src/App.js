import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import $ from "jquery";

import Tone from 'tone';

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

class App extends Component {

	constructor() {
		super();
		this.height=window.innerHeight-10 + 'px';
		this.notesToAdd = [
			'B3', 'C#4', 'D#4', 'E4', 'F#4', 'A4', 'B4',
			'C#4', 'D#5', 'E5', 'F#5', 'G#4', 'A5', 'B5',
			'C#6', 'D#6', 'E6'
		];
		this.circles = [];
		for (var i = 0; i < this.notesToAdd.length; i++) {
			const index = i;
			const element = <circle 
								onClick={()=>this.handleClick(this.notesToAdd[index])}
								key={index} 
								id={this.notesToAdd[index]}
								cx={this.getRandomX()} 
								cy={this.getRandomY()} 
								r={this.getRandomRadius()}>
							</circle>;
			this.circles.push(element);
		}
		this.piano = new Tone.Sampler({
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
	}

	componentDidMount() {
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


		const notes1 = [
			'B3', 'C#4', 'D#4', 'E4', 'F#4', 'A4', 'B4',
			'C#4', 'D#5', 'E5', 'F#5', 'G#4', 'A5', 'B5',
			'C#6', 'D#6', 'E6'
		];

		const CMajorScale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
		const DMajorScale = ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];
		const GMajorScale = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'];

		const NEGRA = 1;
		const BLANCA = NEGRA * 2;
		const REDONDA = BLANCA * 2;
		const CORCHEA = NEGRA / 2;
		const SEMICORCHEA = CORCHEA / 2;
		const FUSA = SEMICORCHEA / 2;
		const CORCHEA_TRESSILLO = NEGRA / 3;
		const NEGRA_CON_PUNTILLO = NEGRA * 1.5;
		const BLANCA_CON_PUNTILLO = BLANCA * 1.5;
		const CORCHEA_CON_PUNTILLO = CORCHEA * 1.5;
		const SEMICORCHEA_CON_PUNTILLO = SEMICORCHEA * 1.5;

		const POSSIBLE_TEMPOS = [
			NEGRA, BLANCA, CORCHEA
		];

		/*
		const POSSIBLE_TEMPOS = [
			NEGRA, BLANCA, REDONDA, CORCHEA, SEMICORCHEA, FUSA, CORCHEA_TRESSILLO,
			NEGRA_CON_PUNTILLO, BLANCA_CON_PUNTILLO, CORCHEA_CON_PUNTILLO, SEMICORCHEA_CON_PUNTILLO
		];
		*/

		function getRandomTempo() {
			const tempos = POSSIBLE_TEMPOS;
			let randomTempo = Math.floor(tempos.length - Math.random() * tempos.length);
			return tempos[randomTempo];
		}

		function getRadomNote() {

			const notes = notes1;

			let randomNote = Math.floor(notes.length - Math.random() * notes.length);
			return notes[randomNote];
		}

		function generateMusicAndTempo() {
			const numberOfNotes = 100;
			const song = [];
			let currentTempo = 0;
			for (let i = 0; i < numberOfNotes; i++) {
				const tempo = getRandomTempo();
				currentTempo += tempo;
				song.push(["0:" + currentTempo, getRadomNote(), '1t']);

			}
			console.log(song);
			return song;
		}

		function generateMusic() {
			const numberOfNotes = 10;
			const song = [];
			for (let i = 0; i < numberOfNotes; i++) {
				song.push(["0:" + i, getRadomNote(), '1t']);
			}

			return song;
		}

		function playMusic() {
			const song = generateMusicAndTempo();
			var part = new Tone.Part(function (time, note, duration) {
				//the notes given as the second element in the array
				//will be passed in as the second argument
				piano.triggerAttackRelease(note, duration, time);
				Tone.Draw.schedule(function () {
					//the callback synced to the animation frame at the given time
					/*
					$("#" + note).css("opacity", 1).animate({ "opacity": 0 }, 300);
					const note = $("#" + note);
					console.log(note);
					note.css("opacity", 1).animate({ "opacity": 0 }, 300);
					*/
					const element = document.getElementById(note);
					console.log(element);
					element.style.fill = getRandomColor();
					element.style.transition = 'fill 0.5s';
					element.style.opacity = 1;
					setTimeout(() => {
						element.style.fill = "white";
						element.style.transition = 'fill 0.5s';
						element.style.opacity = 0.3;
					}, 500);
				}, time);
			}, song);

			setTimeout(() => {
				const BPM = 100;
				Tone.Transport.bpm.rampTo(BPM);
				part.start();
				Tone.Transport.start();
			}, 1000);
		}

		// Number of notes

		playMusic();



		//play a middle 'C' for the duration of an 8th note
		/*
    setTimeout(() => {
			part.start("1m").stop("4m");
			Tone.Transport.bpm.rampTo(40);
      Tone.Transport.start();
    }, 1000);*/
		//piano.triggerAttackRelease("C1", "8n");
		this.handleClick = this.handleClick.bind(this);
		this.getRandomColor = this.getRandomColor.bind(this);
	}

	getRandomX() {
		const MAX = document.getElementsByTagName('body')[0].clientWidth - 30;
		let x = Math.floor(MAX - Math.random() * MAX) + 30;
		return x;
	}

	getRandomY() {
		const MAX = window.innerHeight - 40;
		let y = Math.floor(MAX - Math.random() * MAX)+40;
		return y;
	}

	getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	getRandomRadius() {
		const MAX = 40;
		const MIN = 5;
		let radius = Math.floor(MAX - Math.random() * MAX)+5;
		return radius;
	}

	handleClick(nota) {
		this.piano.triggerAttackRelease(nota, "8n");
	}
	render() {
		return (<svg height={this.height} width="100%" id="field">{this.circles}</svg>);
	}
}

export default App;
