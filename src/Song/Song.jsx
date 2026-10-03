import React, { Component } from "react";
import {
  CURRENT_SOUNDS,
  getNotationForPaint,
  CURRENT_SCALE,
} from "../Constants";
import { Renderer, Stave, StaveNote, Accidental, Formatter, Beam, Barline } from "vexflow";
import "./Song.css";

class Song extends Component {
  constructor() {
    super();
    this.state = {
      isSong: false,
      creationDate: 0,
    };
    this.tabRef = React.createRef();
    this.paintSong = this.paintSong.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.paintSong(this.props.song, this.props.tempo);
  }

  paintSong(song, tempo) {
    if (!song || song.length === 0) return;

    const container = this.tabRef.current || document.getElementById("tab");
    if (!container) return;

    // Clear previous render cleanly
    container.innerHTML = "";

    const width = Math.max(300, window.innerWidth - 40); // Dynamic width with padding
    const measuresPerLine = Math.max(1, Math.floor(width / 250));
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, Math.ceil(song.length / measuresPerLine) * 150 + 100); // Add some height buffer
    const context = renderer.getContext();
    let stave = new Stave(10, 40, 250);
    stave
      .addClef("treble")
      .addTimeSignature("4/4")
      .addKeySignature(CURRENT_SCALE)
      .setTempo({ duration: "q", bpm: tempo }, -30);

    let currentBar = [];
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
        let item = new StaveNote({
          keys: [sound[0].replace("#", "") + "/" + scale],
          duration: duration,
        });

        if (note.accidental) {
          item.addModifier(new Accidental("#"), 0);
        }

        item.setAttribute("id", `${i}-${j}`);
        currentBar.push(item);
      }

      let beams;
      if (i === song.length - 1) {
        stave.setEndBarType(Barline.type.END);
        stave.setContext(context).draw();
        beams = Beam.generateBeams(currentBar);
        Formatter.FormatAndDraw(context, stave, currentBar);
        beams.forEach(function (b) {
          b.setContext(context).draw();
        });

        // Ensure IDs exist on the generated SVG elements for note highlighting
        currentBar.forEach((note, index) => {
          const el = note.getSVGElement ? note.getSVGElement() : (note.attrs && note.attrs.el);
          if (el) {
            el.id = `vf-${i}-${index}`;
          }
        });
      } else {
        stave.setContext(context).draw();
        beams = Beam.generateBeams(currentBar);
        Formatter.FormatAndDraw(context, stave, currentBar);
        beams.forEach(function (b) {
          b.setContext(context).draw();
        });

        // Ensure IDs exist on the generated SVG elements for note highlighting
        currentBar.forEach((note, index) => {
          const el = note.getSVGElement ? note.getSVGElement() : (note.attrs && note.attrs.el);
          if (el) {
            el.id = `vf-${i}-${index}`;
          }
        });

        if ((i + 1) % measuresPerLine === 0) { // Wrap based on dynamic measuresPerLine
          y = stave.y + 120;
          x = 10;
          stave = new Stave(x, y, 220);
          stave.addClef("treble");
          stave.addKeySignature(CURRENT_SCALE);
        } else {
          stave = new Stave(x, y, 220);
        }
      }
      currentBar = [];
    }
    this.setState({ isSong: true });
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.paintSong(this.props.song, this.props.tempo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.song !== this.props.song || prevProps.tempo !== this.props.tempo) {
      this.paintSong(this.props.song, this.props.tempo);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    return (
      <section className="song-container">
        <h3>Generated {this.props.creationDate}</h3>
        <p>Improvisation created over {CURRENT_SCALE} Major Scale </p>
        <div id="tab" ref={this.tabRef}></div>
      </section>
    );
  }
}

export default Song;
