import React, { Component } from 'react';
import * as Tone from 'tone';
import Panel from './Panel/Panel';
import Song from './Song/Song';
import Visualizator from './Visualizator/Visualizator';
import { generateSong } from './Generators/MusicGenerator';
import { CURRENT_SOUNDS, SALAMANDER_PIANO_SOUNDS, getNotationForPlay, changeScale } from './Constants';
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
			creationDate: 0,
			visualizatorType: "circles"
		};

		// Set the piano instrument
		this.piano = new Tone.Sampler(SALAMANDER_PIANO_SOUNDS, {
			'release': 1,
			'baseUrl': import.meta.env.BASE_URL + '/salamander/'
		}).toDestination();

		this.handlePlaySong = this.handlePlaySong.bind(this);
		this.bringToTop = this.bringToTop.bind(this);
		this.handleGenerate = this.handleGenerate.bind(this);
		this.handleStopSong = this.handleStopSong.bind(this);
		this.handleRun = this.handleRun.bind(this);
		this.handleChangeVisualization = this.handleChangeVisualization.bind(this);
	}

	bringToTop(targetElement) {
		// put the element at the bottom of its parent
		let parent = targetElement.parentNode;
		parent.appendChild(targetElement);
	}

	componentDidMount() {
		this.handleGenerate();
		// Auto-play removed
	}

	handleGenerate() {
		const song = generateSong(this.state.duration);
		this.setState({
			song,
			generated: true,
			creationDate: moment(Date.now()).format('DD-MMM-YY HH:mm:ss')
		});
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
				// Push an object with named properties instead of an array
				// The 'time' property is implicitly used by Tone.Part if we pass an array of events, 
				// but Tone.Part expects [time, value]. We will pass [time, valueObject].
				newSong.push({
					time: i + ":" + currentTempo,
					note: sound,
					duration: duration,
					vfId: `vf-${i}-${j}`
				});
				currentTempo += note.duration;
			}

		}
		return newSong;
	}

	transformElement(element, kind, note) {
		if (kind === 'circles') {
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
			if (~note.indexOf("#")) {
				element.classList.add('black-pressed');
			} else {
				element.classList.add('white-pressed');
			}
			setTimeout(() => {
				element.classList.remove("black-pressed");
				element.classList.remove("white-pressed");
			}, 500);
		}
	}

	handlePlaySong() {
		const song = this.translateForTone(this.state.song);
		Tone.Transport.cancel();
		Tone.Transport.clear();
		new Tone.Part((time, event) => {
			// event is the object we pushed: { note, duration, vfId }
			this.piano.triggerAttackRelease(event.note, event.duration, time);
			Tone.Draw.schedule(() => {
				// 1. Visualizator Circle Highlight
				const element = document.getElementById(event.note);
				if (element) {
					this.transformElement(element, this.state.visualizatorType, event.note);
				} else {
					console.log("CIRCLE_NOT_FOUND", event.note);
				}

				// 2. Sheet Music Note Highlight
				const noteElement = document.getElementById(event.vfId);
				if (noteElement) {
					noteElement.classList.add('note-highlight');
					// Remove highlight after duration (converted to ms approx)
					// Tone.Time(event.duration).toSeconds() gives seconds.
					const durationMs = Tone.Time(event.duration).toSeconds() * 1000;
					setTimeout(() => {
						noteElement.classList.remove('note-highlight');
					}, durationMs);
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

	handleRun(speed, duration, scale) {
		this.setState({
			fff: true
		});
		this.handleStopSong();
		this.setState({});
		changeScale(scale);
		this.setState({
			duration,
			speed,
			song: []
		}, () => {
			this.handleGenerate();
			this.handleGenerate();
			// Auto-play removed (user must click Play)
		});
	}

	handleChangeVisualization(type) {
		this.setState({
			visualizatorType: type
		});
	}

	render() {
		return (
			<div>
				<Visualizator type={this.state.visualizatorType} />
				<Panel tempo={this.state.speed} duration={this.state.duration} handleRun={this.handleRun} handleChangeVisualization={this.handleChangeVisualization} />

				<div style={{ textAlign: 'center', marginTop: '10px' }}>
					<button onClick={this.handlePlaySong}>Play Melody</button>
				</div>
				{
					(this.state.song.length) ?
						<Song song={this.state.song}
							creationDate={this.state.creationDate}
							tempo={this.state.speed}
							handlePlaySong={this.handlePlaySong} /> :
						<p>Loading ...</p>
				}

			</div>
		);
	}

}

export default App;
