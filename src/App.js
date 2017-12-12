import generateSong from './generator';
import React, { Component } from 'react';
import './App.css';

import Tone from 'tone';
import Vex from 'vexflow';

const notesa = [
	"C4", "D4", "E4", "F4", "G4", "A4", "B4",
	"C5", "D5", "E5", "F5", "G5", "A5", "B5"
];

class App extends Component {

	constructor() {
		super();
		// Some initializations
		this.height = window.innerHeight - 5;
		this.width = window.innerWidth - (window.innerWidth * 0.4);
		this.minimumRadius = 40;
		// Set the initial state
		this.state = {
			circles: [],
			speed: 100,
			duration: 10,
			generated: false,
			song: [],
			isPlaying: false,
			creationDate: 0
		};

		// Set the piano instrument
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

		this.handleClick = this.handleClick.bind(this);
		this.getRandomColor = this.getRandomColor.bind(this);
		this.getRandomFigure = this.getRandomFigure.bind(this);
		this.getRandomNote = this.getRandomNote.bind(this);
		this.generateAllNotes = this.generateAllNotes.bind(this);
		this.generateMusicAndTempo = this.generateMusicAndTempo.bind(this);
		this.addCircles = this.addCircles.bind(this);
		this.handlePlaySong = this.handlePlaySong.bind(this);
		this.bringToTop = this.bringToTop.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleGenerate = this.handleGenerate.bind(this);
		this.handleStopSong = this.handleStopSong.bind(this);
		this.paintSong = this.paintSong.bind(this);
	}

	addCircles(notesToAdd) {
		const circles = [];
		for (var i = 0; i < notesToAdd.length; i++) {
			const index = i;
			const element = <circle
				onClick={() => this.handleClick(notesToAdd[index])}
				key={index}
				id={notesToAdd[index]}
				cx={this.getRandomX()}
				cy={this.getRandomY()}
				r={this.getRandomRadius()}
				data-color={this.getRandomColor()}>
			</circle>;
			circles.push(element);
		}
		this.setState({ circles });
	}

	generateAllNotes() {
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
	}

	getRandomFigure(possibleFigures) {
		let randomTempo = Math.floor(possibleFigures.length - Math.random() * possibleFigures.length);
		return possibleFigures[randomTempo];
	}

	getRandomNote(posibleNotes) {
		let randomNote = Math.floor(posibleNotes.length - Math.random() * posibleNotes.length);
		return posibleNotes[randomNote];
	}

	generateMusicAndTempo(duration, posibleNotes, possibleFigures) {
		const song = [];
		let currentTempo = 0;
		while (currentTempo < duration) {
			const tempo = this.getRandomFigure(possibleFigures);
			let figure;
			if (tempo === 1) { figure = '1q' };
			currentTempo += tempo;
			song.push(["0:" + currentTempo, this.getRandomNote(posibleNotes), figure]);
		}
		return song;
	}

	bringToTop(targetElement) {
		// put the element at the bottom of its parent
		let parent = targetElement.parentNode;
		parent.appendChild(targetElement);
	}

	getRandomX() {
		const MAX = this.width - this.minimumRadius;
		let x = Math.floor(MAX - Math.random() * MAX);
		if (x < this.minimumRadius) {
			x += this.minimumRadius;
		}
		return x;
	}

	getRandomY() {
		const MAX = this.height - this.minimumRadius;
		let y = Math.floor(MAX - Math.random() * MAX);
		if (y < this.minimumRadius) {
			y += this.minimumRadius;
		}
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
		const MAX = this.minimumRadius;
		const MIN = 5;
		let radius = Math.floor(MAX - Math.random() * MAX) + MIN;
		return radius;
	}

	componentDidMount() {
		const allNotes = this.generateAllNotes();
		this.addCircles(allNotes);
	}

	handleClick(note) {
		this.piano.triggerAttackRelease(note, "8n");
	}

	handleChange(event) {
		let fieldName = event.target.name;
		let fieldValue;
		if (fieldName === 'notes' || fieldName === 'figures') {
			fieldValue = event.target.value.split(',');
			this.setState({ [fieldName]: fieldValue });
		} else {
			fieldValue = event.target.value;
			this.setState({ [fieldName]: fieldValue });
		}
	}

	handleGenerate() {
		const song = generateSong(this.state.duration);
		this.setState({ song: song });
		this.setState({ generated: true });
		this.paintSong(song);
		this.setState({ creationDate: Date.now() });
	}

	getNotationForPaint(duration) {
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

	getNotationForPlay(duration) {
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
	}

	paintSong(song) {
		const VF = Vex.Flow;
		let bars = song.length;
		let currentBar = [];
		var div = document.getElementById("boo");
		let parent = div.parentNode;
		parent.removeChild(div);
		div = document.createElement("div");
		div.setAttribute('id', 'boo');
		parent.appendChild(div);
		var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
		renderer.resize(500, (bars / 2) * 135);
		var context = renderer.getContext();
		var stave = new VF.Stave(10, 40, 240);
		stave.addClef("treble").addTimeSignature("4/4");
		for (let i = 0; i < song.length; i++) {
			const notes = song[i].notes; // measure notes
			let x = stave.width + stave.x;
			let y = stave.y;
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				const sound = notesa[note.sound] ;
				const scale = sound[1];
				let duration = this.getNotationForPaint(note.duration);
				let item = new VF.StaveNote({ keys: [sound[0] + '/' + scale], duration: duration });
				if (note.accidental) {
					item.addAccidental(0, new VF.Accidental("#"));
				}
				currentBar.push(item);
			}
			let beams;
			if (i === song.length-1){
				stave.setEndBarType(VF.Barline.type.END);
				stave.setContext(context).draw();
				beams = VF.Beam.generateBeams(currentBar);
				VF.Formatter.FormatAndDraw(context, stave, currentBar);
				beams.forEach(function(b) {b.setContext(context).draw()});
			}
			else {
				stave.setContext(context).draw();
				beams = VF.Beam.generateBeams(currentBar);
				VF.Formatter.FormatAndDraw(context, stave, currentBar);
				beams.forEach(function(b) {b.setContext(context).draw()});
				if ( (i+1)%2 === 0) {
					y = stave.y + 120;
					x = 10;
					stave = new VF.Stave(x, y, 220);
					stave.addClef("treble");
				} else {
					stave = new VF.Stave(x, y, 220);
				}
			}
			currentBar = [];	
		}
	}

	translateForTone(song){
		const newSong = [];
		for (let i = 0; i < song.length; i++) {
			let currentTempo = 0;
			const notes = song[i].notes; // measure notes
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				let sound = notesa[note.sound];
				if (note.accidental) {
					sound = sound.slice(0, 1) + ("#") + sound.slice(1 + 0)
				}
				let duration = this.getNotationForPlay(note.duration);
				newSong.push([i + ":" + currentTempo, sound, duration]);
				currentTempo += note.duration;	
			}

		}
		return newSong;
	}

	handlePlaySong() {
		const song = this.translateForTone(this.state.song);
		Tone.Transport.cancel();
		Tone.Transport.clear();
		new Tone.Part((time, note, duration) => {
			this.piano.triggerAttackRelease(note, duration, time);
			Tone.Draw.schedule(() => {
				const element = document.getElementById(note);
				if (element) {
					this.bringToTop(element);
					const color = element.getAttribute('data-color');
					const originalRadius = Number(element.getAttribute('r'));
					element.style.fill = color;
					element.style.opacity = 1;
					element.style.r = originalRadius + 5;
					element.style.transition = 'all 0.5s';
					setTimeout(() => {
						element.style.fill = "white";
						element.style.opacity = 0.3;
						element.style.r = originalRadius;
						element.style.transition = 'all 0.5s';
					}, 500);
				} else {
					console.log("CIRCLE_NOT_FOUND", note);
				}
			}, time);
		}, song).start();
		Tone.Transport.bpm.rampTo(this.state.speed);
		Tone.Transport.start();
		this.setState({ isPlaying: true });
	}

	handleStopSong() {
		Tone.Transport.stop();
		Tone.Transport.cancel();
		Tone.Transport.clear();
		this.setState({ isPlaying: false });
	}

	render() {
		return (
			<div>
				<svg height={this.height + 'px'} width={this.width + 'px'} className="svg">{this.state.circles}</svg>
				<div className="panel">
					<div className="params">
						<div>
							Speed: 	<input name="speed" type="number" min="1" max="400"
								onChange={this.handleChange} value={this.state.speed} /> BPM
						</div>
						<div>
							Duration: 	<input name="duration" type="number" min="1" max="400"
								onChange={this.handleChange} value={this.state.duration} /> Measures
						</div>
					</div>
					<div className="buttons">
						<div>
							<button onClick={this.handleGenerate}>Generate Melody</button>
						</div>
						<div className="song-container">
							<h3>Generated {this.state.creationDate}</h3>
							<div id="boo"></div>
						</div>
						{(this.state.generated) ? '' : ''}
						{(this.state.generated && !this.state.isPlaying) ? <div>
							<button onClick={this.handlePlaySong}>Play Melody</button>
						</div> : ''}
						{(this.state.generated && this.state.isPlaying) ? <div>
							<button onClick={this.handleStopSong}>Stop Melody</button>
						</div> : ''}
					</div>
				</div>
			</div>

		);
	}

}

export default App;
