import React, { Component } from 'react';
import Tone from 'tone';
import Panel from './Panel/Panel';
import Song from './Song/Song';
import Visualizator from './Visualizator/Visualizator';
import { generateSong } from './Generators/MusicGenerator';
import { CURRENT_SOUNDS, SALAMANDER_PIANO_SOUNDS, getNotationForPlay } from './Constants';
import './App.css';
import moment from 'moment';

class App extends Component {

	constructor() {
		super();
		
		// Set the initial state
		this.state = {
			speed: 100,
			duration: 10,
			generated: false,
			song: [],
			isPlaying: false,
			creationDate: 0
		};

		// Set the piano instrument
		this.piano = new Tone.Sampler(SALAMANDER_PIANO_SOUNDS, {
			'release': 1,
			'baseUrl': './salamander/'
		}).toMaster();

		this.handlePlaySong = this.handlePlaySong.bind(this);
		this.bringToTop = this.bringToTop.bind(this);
		this.handleGenerate = this.handleGenerate.bind(this);
		this.handleStopSong = this.handleStopSong.bind(this);
	}

	bringToTop(targetElement) {
		// put the element at the bottom of its parent
		let parent = targetElement.parentNode;
		parent.appendChild(targetElement);
	}

	componentDidMount() {
		this.handleGenerate();
		setTimeout(()=>{
			this.handlePlaySong();
		}, 1000);
		
	}

	handleGenerate() {
		const song = generateSong(this.state.duration);
		this.setState({ song: song });
		this.setState({ generated: true });
		this.setState({ creationDate: moment(Date.now()).format('DD-MMM-YY HH:mm:ss') });
	}

	translateForTone(song) {
		const newSong = [];
		for (let i = 0; i < song.length; i++) {
			let currentTempo = 0;
			const notes = song[i].notes; // measure notes
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				let sound = CURRENT_SOUNDS[note.sound];
				let duration = getNotationForPlay(note.duration);
				newSong.push([i + ":" + currentTempo, sound, duration]);
				currentTempo += note.duration;
			}

		}
		return newSong;
	}

	handlePlaySong() {
		const song = this.translateForTone(this.state.song);
		console.log(song);
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
				<Panel/>
				<Visualizator />
				<Song song={this.state.song} creationDate={this.state.creationDate}/>
			</div>
		);
	}

}

export default App;
