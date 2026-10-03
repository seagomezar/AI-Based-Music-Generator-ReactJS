import React, { Component } from "react";
import {
  CURRENT_SOUNDS,
  getNotationForPaint,
  CURRENT_SCALE,
} from "../Constants";
import { Renderer, Stave, StaveNote, Accidental, Formatter, Beam, Barline } from "vexflow";
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
    const tonalityName = SCALE_NAMES_ES[CURRENT_SCALE] || CURRENT_SCALE;

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
