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
    this.paintSong = this.paintSong.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.paintSong(this.props.song, this.props.tempo);
  }

  paintSong(song, tempo) {
    if (!song || song.length === 0) return;

    // Cleanup previous render if exists
    const oldDiv = document.getElementById("boo");
    if (oldDiv) {
      oldDiv.remove();
    }

    const divId = "tab";
    const parentDiv = document.getElementById("tab-container") || document.getElementById(divId)?.parentNode;

    // Ensure we have a valid container
    if (!parentDiv) return;

    // Clear container (safer than removing/creating divs repeatedly in a way that might lose reference)
    // But let's stick to the previous pattern if it worked, just adapted for safety
    // The previous code was obtaining 'tab', removing it, and creating 'boo'. 
    // Let's ensure we find the container properly.

    // Re-implementation of existing DOM logic but safer:
    let container = document.getElementById("tab");
    if (!container) {
      // If "tab" is gone (replaced by "boo"), try to find "boo" to replace it back or just use parent
      container = document.getElementById("boo");
    }

    if (!container) return; // Should not happen

    let parent = container.parentNode;
    // Remove old container
    parent.removeChild(container);

    // Create new container
    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", "boo"); // Keep using 'boo' as the reactive container
    parent.appendChild(newDiv);

    const width = window.innerWidth - 40; // Dynamic width with padding

    let currentBar = [];
    var renderer = new Renderer(newDiv, Renderer.Backends.SVG);
    const measuresPerLine = Math.floor(width / 250);
    renderer.resize(width, Math.ceil(song.length / measuresPerLine) * 150 + 100); // Add some height buffer
    var context = renderer.getContext();
    var stave = new Stave(10, 40, 250);
    stave
      .addClef("treble")
      .addTimeSignature("4/4")
      .addKeySignature(CURRENT_SCALE)
      .setTempo({ duration: "q", bpm: tempo }, -30);

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

        // Assign IDs to the generated SVG elements for highlighting
        currentBar.forEach((note, index) => {
          if (note.attrs && note.attrs.el) {
            note.attrs.el.id = `vf-${i}-${index}`;
          }
        });

      } else {
        stave.setContext(context).draw();
        beams = Beam.generateBeams(currentBar);
        Formatter.FormatAndDraw(context, stave, currentBar);
        beams.forEach(function (b) {
          b.setContext(context).draw();
        });

        // Assign IDs to the generated SVG elements for highlighting
        currentBar.forEach((note, index) => {
          if (note.attrs && note.attrs.el) {
            note.attrs.el.id = `vf-${i}-${index}`;
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
    setTimeout(() => {
      this.paintSong(this.props.song, this.props.tempo);
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    return (
      <section className="song-container">
        <h3>Generated {this.props.creationDate}</h3>
        <p>Improvisation created over {CURRENT_SCALE} Major Scale </p>
        <div id="tab"></div>
      </section>
    );
  }
}

export default Song;
