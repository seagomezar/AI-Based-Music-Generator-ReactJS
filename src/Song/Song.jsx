import React, { Component } from "react";
import {
  CURRENT_SOUNDS,
  getNotationForPaint,
  CURRENT_SCALE,
} from "../Constants";
import { Renderer, Stave, StaveNote, Accidental, Formatter, Beam, Barline } from "vexflow";
import "./Song.css";

class Song extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSong: false,
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

    const containerWidth = container.clientWidth || Math.min(1140, window.innerWidth - 80);
    const width = Math.max(320, containerWidth - 10);
    const measureWidth = 240;
    const measuresPerLine = Math.max(1, Math.floor(width / measureWidth));
    const linesCount = Math.ceil(song.length / measuresPerLine);

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, linesCount * 140 + 80);
    const context = renderer.getContext();

    // Scale group to look crisp
    let stave = new Stave(10, 30, measureWidth);
    stave
      .addClef("treble")
      .addTimeSignature("4/4")
      .addKeySignature(CURRENT_SCALE)
      .setTempo({ duration: "q", bpm: tempo }, -20);

    let currentBar = [];
    for (let i = 0; i < song.length; i++) {
      const notes = song[i].notes;
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

        if ((i + 1) % measuresPerLine === 0) {
          y = stave.y + 120;
          x = 10;
          stave = new Stave(x, y, measureWidth);
          stave.addClef("treble");
          stave.addKeySignature(CURRENT_SCALE);
        } else {
          stave = new Stave(x, y, measureWidth);
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
    const { song, creationDate, tempo, activeNote } = this.props;

    return (
      <section className="song-stage-card">
        {/* Score Chassis Header */}
        <div className="score-header">
          <div className="score-header-title">
            <span className="score-status-dot" />
            <div>
              <h3 className="score-title">
                Improvisation created over {CURRENT_SCALE} Major Scale
              </h3>
              <p className="score-subtitle">
                Generated {creationDate} • Tempo: {tempo} BPM • Engine: VexFlow Vector Engraver
              </p>
            </div>
          </div>

          <div className="score-header-badges">
            {activeNote ? (
              <div className="score-badge active-note-badge">
                <span className="live-dot" />
                <span className="badge-dim">Playing:</span>
                <span className="badge-highlight">{activeNote}</span>
              </div>
            ) : (
              <div className="score-badge">
                <span className="badge-dim">Status:</span>
                <span className="badge-val">Ready</span>
              </div>
            )}
            <div className="score-badge">
              <span className="badge-dim">Measures:</span>
              <span className="badge-primary">{song ? song.length : 0}</span>
            </div>
          </div>
        </div>

        {/* The Pristine Score Paper Canvas */}
        <div className="score-paper-canvas">
          {/* Parchment Rivet Accents */}
          <span className="paper-screw top-left" />
          <span className="paper-screw top-right" />
          <span className="paper-screw bottom-left" />
          <span className="paper-screw bottom-right" />

          {/* Classical Title Banner on Paper */}
          <div className="paper-top-banner">
            <span className="banner-tempo">Tempo = {tempo} • Espressivo e Cantabile</span>
            <span className="banner-source">Salamander Polyphonic Grand / Algorithmic Composition</span>
          </div>

          {/* VexFlow Notation SVG Render Target */}
          <div id="tab" ref={this.tabRef} className="score-svg-viewport"></div>

          {/* Score Lower Information Bar */}
          <div className="paper-bottom-banner">
            <div className="banner-meta-items">
              <span>Clef: Treble (G2)</span>
              <span>•</span>
              <span>Key: {CURRENT_SCALE} Major</span>
              <span>•</span>
              <span>Time: 4/4 Meter</span>
            </div>
            <div className="banner-engine-status">
              VexFlow Canvas Buffer: Dynamic Path Interpolation Active
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Song;
