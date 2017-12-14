import React, { Component } from 'react';
import { CURRENT_SOUNDS, WIDTH, getNotationForPaint, CURRENT_SCALE } from '../Constants'
import Vex from 'vexflow';
import './Song.css';

class Song extends Component {

    constructor() {
        super();
        this.state = {
            isSong: false,
            creationDate: 0
        };
        this.paintSong = this.paintSong.bind(this);
    }

    paintSong(song, tempo) {
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
		stave.addClef("treble").addTimeSignature("4/4")
		.setTempo({ duration: 'q', bpm: tempo }, -30);

		for (let i = 0; i < song.length; i++) {
			const notes = song[i].notes; // measure notes
			let x = stave.width + stave.x;
			let y = stave.y;
			for (let j = 0; j < notes.length; j++) {
				const note = notes[j];
				const sound = CURRENT_SOUNDS[note.sound];
				let scale = sound[1];
				if (note.accidental) {
					scale = sound[2];
				}
				let duration = getNotationForPaint(note.duration);
				let item = new VF.StaveNote({ keys: [sound[0].replace('#', '') + '/' + scale], duration: duration });
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
        this.setState({isSong: true});
    }
    
    componentDidMount() {
        setTimeout(() => {
            this.paintSong(this.props.song, this.props.tempo);
        }, 1000);
    }

    render() {
		return (
            <section className="song-container">
				<h3>Generated {this.props.creationDate}</h3>
				<p>Improvisation created over {CURRENT_SCALE} Major Scale </p>
                <div id="boo"></div>
            </section>);
    }
}

export default Song;