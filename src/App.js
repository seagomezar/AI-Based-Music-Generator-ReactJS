import React, { Component } from 'react';
import Tone from 'tone';
import Vex from 'vexflow';
import { generateSong, generateAllNotes } from './MusicGenerator';
import { generateCircle } from './VisualGenerator';
import { HEIGHT, NICE_SONGS, SALAMANDER_PIANO_SOUNDS, WIDTH, getNotationForPaint, getNotationForPlay } from './Constants';
import './App.css';

class App extends Component {

	constructor() {
		super();
		// Some initializations
		this.height = HEIGHT;
		this.width = WIDTH;
		// Set the initial state
		this.state = {
			circles: [],
			speed: 100,
			duration: 10,
			generated: false,
			song: [],
			isPlaying: false,
			creationDate: 0,
			isTopBarShowed: false
		};

		// Set the piano instrument
		this.piano = new Tone.Sampler(SALAMANDER_PIANO_SOUNDS, {
			'release': 1,
			'baseUrl': './salamander/'
		}).toMaster();

		this.addCircles = this.addCircles.bind(this);
		this.handlePlaySong = this.handlePlaySong.bind(this);
		this.bringToTop = this.bringToTop.bind(this);
		this.handleGenerate = this.handleGenerate.bind(this);
		this.handleStopSong = this.handleStopSong.bind(this);
		this.paintSong = this.paintSong.bind(this);

		// PanelFunctions
		this.hideTopBar = this.hideTopBar.bind(this);
		this.showTopBar = this.showTopBar.bind(this);
	}

	addCircles(notesToAdd) {
		const circles = [];
		for (var i = 0; i < notesToAdd.length; i++) {
			const circle = generateCircle(notesToAdd[i]);
			circles.push(circle);
		}
		this.setState({ circles });
	}

	bringToTop(targetElement) {
		// put the element at the bottom of its parent
		let parent = targetElement.parentNode;
		parent.appendChild(targetElement);
	}

	componentDidMount() {
		const allNotes = generateAllNotes();
		this.addCircles(allNotes);
		this.handleGenerate();
	}

	handleGenerate() {
		const song = generateSong(this.state.duration);
		this.setState({ song: song });
		this.setState({ generated: true });
		this.paintSong(song);
		this.setState({ creationDate: Date.now() });
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
		const measuresPerLine = Math.floor(WIDTH / 250);
		renderer.resize(WIDTH, (bars / measuresPerLine) * 150);
		var context = renderer.getContext();
		var stave = new VF.Stave(10, 40, 250);
		stave.addClef("treble").addTimeSignature("4/4");

		for (let i = 0; i < song.length; i++) {
			const notes = song[i].notes; // measure notes
			let x = stave.width + stave.x;
			let y = stave.y;
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				const sound = NICE_SONGS[1][note.sound];
				const scale = sound[1];
				let duration = getNotationForPaint(note.duration);
				let item = new VF.StaveNote({ keys: [sound[0] + '/' + scale], duration: duration });
				if (note.accidental) {
					item.addAccidental(0, new VF.Accidental("#"));
				}
				currentBar.push(item);
			}
			let beams;
			if (i === song.length - 1) {
				stave.setEndBarType(VF.Barline.type.END);
				stave.setContext(context).draw();
				beams = VF.Beam.generateBeams(currentBar);
				VF.Formatter.FormatAndDraw(context, stave, currentBar);
				beams.forEach(function (b) { b.setContext(context).draw() });
			}
			else {
				stave.setContext(context).draw();
				beams = VF.Beam.generateBeams(currentBar);
				VF.Formatter.FormatAndDraw(context, stave, currentBar);
				beams.forEach(function (b) { b.setContext(context).draw() });
				if ((i + 1) % 5 === 0) {
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

	translateForTone(song) {
		const newSong = [];
		for (let i = 0; i < song.length; i++) {
			let currentTempo = 0;
			const notes = song[i].notes; // measure notes
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				let sound = NICE_SONGS[1][note.sound];
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

	hideTopBar() {
		const panel = document.getElementById("panel");
		panel.classList.remove("showBar");
		panel.classList.add("hideBar");
		this.setState({
			isTopBarShowed: false
		});
	}

	showTopBar() {
		const panel = document.getElementById("panel");
		panel.classList.remove("hideBar");
		panel.classList.add("showBar");
		this.setState({
			isTopBarShowed: true
		});
	}

	render() {
		return (
			<div>
				<aside className="panel hideBar" id="panel" >
					<section>
						<h2>What am I listening?</h2>
						<p>
							A computer created song based on bethoven compositions, do you like it?
						</p>
						<h2>What is this?</h2>
						<p>
							Well, It is a interesting questions, I will try to describe the better for you..<br />
							Basically, I am trying to create music using artificial inteligence and a set of patters
							to create differend kind of musical genders and author based composition.
						</p>
						<h2>Can I manipulate what I'm listening?</h2>
						<p>
							Of course my friend there is the set of controls I can give you!. enjoy!
						</p>
						<form>
							<div>
								<label>Speed: </label>
								<input type="number" size="3" />
							</div>
							<div>
								<label># of Measures: </label>
								<input type="number" size="3" />
							</div>
							<div>	<label>Gender like: </label>
								<select>
									<option>Jazz</option>
									<option>Rock</option>
									<option>Clasical </option>
								</select>
							</div>
							<div>
								<label>Author like: </label>
								<select>
									<option>Bethoven</option>
									<option>Mozart</option>
								</select>
							</div>
							<div>
								<label>Scale base: </label>
								<select>
									<option>C Major</option>
									<option>D Major</option>
									<option>G Major</option>
								</select>
							</div>
							<div>
								<button>Run this</button>
							</div>
						</form>
						<h2>How you built this?</h2>
						<p>
							Ok for the implementation I'm using Javascript and react.js with <a href="">Tone.js</a> for the sounds and the timeline to play music,
							<a href="">Salamander Piano</a> to build and play the right piano sounds , and <a href="">Vexflow</a> to pain the score you see below.
							For the hard part which is artificial inteligence I'm using synaptic.js which allow me to create and train a simple neural network which
							is able to create the composition for you. Here is the <a href="">link to the source code</a>
						</p>
						<h2>Wait... Why react?</h2>
						<p>Oh man, no problem, here is the link to the <a href="">angular project</a>, <a href="">vue project</a>, and <a href="">vanilla js project</a>.</p>
						<h2>What next for this project?</h2>
						<p>
							Actually I don't have idea, What do you like? more author based compositions?,
							more genders?, different kind of artificial inteligence structures like Marcov Models?,
							Deep Machine Learning? Shoot me with your ideas with a PR!
						</p>
					</section>
					<nav>
						{
							(this.state.isTopBarShowed) ?
								<button onClick={this.hideTopBar}>Hide</button> :
								<button onClick={this.showTopBar}>More Info</button>
						}
					</nav>
				</aside>
				<svg height={this.height + 'px'} width={this.width + 'px'} className="svg">{this.state.circles}</svg>
				<section className="song-container">
					<h3>Generated {this.state.creationDate}</h3>
					<div id="boo"></div>
				</section>
			</div>
		);
	}

}

export default App;
