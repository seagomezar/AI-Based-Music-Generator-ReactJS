import React, { Component } from "react";
import {
  CURRENT_SOUNDS,
  getNotationForPaint,
  CURRENT_SCALE,
} from "../Constants";
import { Renderer, Stave, StaveNote, Voice, Accidental, Formatter, Beam, Barline } from "vexflow";
import "./Song.css";

const SCALE_NAMES_ES = {
  'C': 'Do',
  'D': 'Re',
  'E': 'Mi',
  'F': 'Fa',
  'G': 'Sol',
  'A': 'La',
  'B': 'Si',
  'F#': 'Fa#',
};

export function soundToVexKey(sound) {
  if (!sound) return "c/4";
  const match = sound.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return sound.toLowerCase();
  return `${match[1].toLowerCase()}/${match[2]}`;
}

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

    // Clear previous render
    container.innerHTML = "";

    const activeScale = this.props.scale || CURRENT_SCALE;

    const containerWidth = container.clientWidth || Math.min(1140, window.innerWidth - 80);
    const width = Math.max(320, containerWidth - 10);
    const measureWidth = 240;
    const measuresPerLine = Math.max(1, Math.floor(width / measureWidth));
    const linesCount = Math.ceil(song.length / measuresPerLine);

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, linesCount * 140 + 80);
    const context = renderer.getContext();

    let stave = new Stave(10, 30, measureWidth);
    stave
      .addClef("treble")
      .addTimeSignature("4/4")
      .addKeySignature(activeScale)
      .setTempo({ duration: "q", bpm: tempo }, -20);

    let currentBar = [];
    for (let i = 0; i < song.length; i++) {
      const notes = song[i].notes;
      let x = stave.width + stave.x;
      let y = stave.y;

      for (let j = 0; j < notes.length; j++) {
        const note = notes[j];
        const sound = CURRENT_SOUNDS[note.sound] || "C4";
        const duration = getNotationForPaint(note.duration);
        const vexKey = soundToVexKey(sound);
        const item = new StaveNote({
          keys: [vexKey],
          duration: duration,
        });

        item.setAttribute("id", `${i}-${j}`);
        currentBar.push(item);
      }

      // Automatically apply key signature accidentals via VexFlow.
      // Notes already sharped or flatted by the key signature (e.g. F#, C#, G#, D#, A# in B Major)
      // will NOT have redundant accidental signs painted on them.
      const voice = new Voice({ num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT);
      voice.addTickables(currentBar);
      Accidental.applyAccidentals([voice], activeScale);

      let beams;
      if (i === song.length - 1) {
        stave.setEndBarType(Barline.type.END);
        stave.setContext(context).draw();
        beams = Beam.generateBeams(currentBar);
        Formatter.FormatAndDraw(context, stave, currentBar);
        beams.forEach(function (b) {
          b.setContext(context).draw();
        });

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
          stave.addKeySignature(activeScale);
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
    if (
      prevProps.song !== this.props.song ||
      prevProps.tempo !== this.props.tempo ||
      prevProps.scale !== this.props.scale
    ) {
      this.paintSong(this.props.song, this.props.tempo);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const { song, creationDate, tempo, activeNote, scale } = this.props;
    const activeScale = scale || CURRENT_SCALE;
    const tonalityName = SCALE_NAMES_ES[activeScale] || activeScale;

    return (
      <section className="classical-sheet-card">
        {/* Card Header */}
        <div className="sheet-card-header">
          <div className="sheet-title-group">
            <h3 className="sheet-piece-title">
              Improvisación en {tonalityName} Mayor
            </h3>
            <p className="sheet-piece-meta">
              Partitura clásica • {creationDate} • {song ? song.length : 0} compases
            </p>
          </div>

          <div className="sheet-badges">
            {activeNote ? (
              <span className="badge-playing">
                Interpretando: <strong>{activeNote}</strong>
              </span>
            ) : (
              <span className="badge-ready">Partitura Lista</span>
            )}
          </div>
        </div>

        {/* Paper Score Canvas */}
        <div className="sheet-paper">
          <div className="paper-header-row">
            <span className="paper-tempo-text">
              Tempo = {tempo} • <em>Espressivo e Cantabile</em>
            </span>
            <span className="paper-instrument-text">Piano Solo</span>
          </div>

          <div id="tab" ref={this.tabRef} className="sheet-svg-container"></div>

          <div className="paper-footer-row">
            <span>Clave de Sol • Tonalidad de {tonalityName} Mayor • Compás de 4/4</span>
            <span>Edición gráfica con VexFlow</span>
          </div>
        </div>
      </section>
    );
  }
}

export default Song;
