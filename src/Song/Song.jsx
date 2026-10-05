import React, { Component } from "react";
import {
  CURRENT_SOUNDS,
  getNotationForPaint,
  CURRENT_SCALE,
} from "../Constants";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Accidental,
  Formatter,
  Beam,
  Barline,
  StaveConnector,
} from "vexflow";
import { soundToVexKey, resolveSopranoSound } from "../Generators/CounterpointGenerator";
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

export { soundToVexKey };

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
    this.paintSong(this.props.song, this.props.tempo, this.props.secondVoice);
  }

  paintSong(song, tempo, secondVoice = null) {
    if (!song || song.length === 0) return;

    const container = this.tabRef.current || document.getElementById("tab");
    if (!container) return;

    // Clear previous render
    container.innerHTML = "";

    const activeScale = this.props.scale || CURRENT_SCALE;
    const hasSecondVoice = Boolean(secondVoice && secondVoice.length > 0);

    const containerWidth = container.clientWidth || Math.min(1140, window.innerWidth - 80);
    const width = Math.max(340, containerWidth - 10);
    const measureWidth = 240;
    const measuresPerLine = Math.max(1, Math.floor(width / measureWidth));
    const linesCount = Math.ceil(song.length / measuresPerLine);

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    // Height per line: 140px for single melody stave, 225px for Grand Staff
    const lineHeight = hasSecondVoice ? 225 : 140;
    renderer.resize(width, linesCount * lineHeight + 80);
    const context = renderer.getContext();

    if (!hasSecondVoice) {
      // ----------------------------------------------------
      // SOLO MELODY RENDERING (Clave de Sol)
      // ----------------------------------------------------
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
          const sound = resolveSopranoSound(note, activeScale);
          const duration = getNotationForPaint(note.duration);
          const vexKey = soundToVexKey(sound);
          const item = new StaveNote({
            keys: [vexKey],
            duration: duration,
          });

          item.setAttribute("id", `${i}-${j}`);
          currentBar.push(item);
        }

        // Apply key signature accidentals automatically
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
    } else {
      // ----------------------------------------------------
      // GRAND STAFF RENDERING (Contrapunto a 2 Voces: Sol + Fa)
      // ----------------------------------------------------
      const systemSpacing = 95;
      const systemMargin = 40;

      let staveTop = new Stave(systemMargin, 25, measureWidth);
      staveTop
        .addClef("treble")
        .addTimeSignature("4/4")
        .addKeySignature(activeScale)
        .setTempo({ duration: "q", bpm: tempo }, -20);

      let staveBottom = new Stave(systemMargin, 25 + systemSpacing, measureWidth);
      staveBottom
        .addClef("bass")
        .addTimeSignature("4/4")
        .addKeySignature(activeScale);

      for (let i = 0; i < song.length; i++) {
        const topNotes = song[i].notes;
        const bottomNotes = (secondVoice[i] && secondVoice[i].notes) ? secondVoice[i].notes : [];
        const isLast = (i === song.length - 1);
        const isStartOfLine = (i === 0 || i % measuresPerLine === 0);

        // Notas del pentagrama superior (Melodía Principal)
        const currentBarTop = topNotes.map((n, j) => {
          const sound = resolveSopranoSound(n, activeScale);
          const duration = getNotationForPaint(n.duration);
          const vexKey = soundToVexKey(sound);
          const item = new StaveNote({
            keys: [vexKey],
            duration: duration,
          });
          item.setAttribute("id", `top-${i}-${j}`);
          return item;
        });

        // Notas del pentagrama inferior (Segunda Voz - Contrapunto Kennan)
        const currentBarBottom = bottomNotes.map((n, j) => {
          const sound = n.soundName || "C3";
          const duration = getNotationForPaint(n.duration);
          const vexKey = soundToVexKey(sound);
          const item = new StaveNote({
            keys: [vexKey],
            clef: "bass",
            duration: duration,
          });
          item.setAttribute("id", `bottom-${i}-${j}`);
          return item;
        });

        const voiceTop = new Voice({ num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(currentBarTop);
        const voiceBottom = new Voice({ num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(currentBarBottom);

        Accidental.applyAccidentals([voiceTop], activeScale);
        Accidental.applyAccidentals([voiceBottom], activeScale);

        if (isLast) {
          staveTop.setEndBarType(Barline.type.END);
          staveBottom.setEndBarType(Barline.type.END);
        }

        staveTop.setContext(context).draw();
        staveBottom.setContext(context).draw();

        // Conectores de sistema clásico (Llave de piano a la izquierda y barras de compás)
        if (isStartOfLine) {
          new StaveConnector(staveTop, staveBottom).setType(StaveConnector.type.BRACE).setContext(context).draw();
          new StaveConnector(staveTop, staveBottom).setType(StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
        }
        if (isLast) {
          new StaveConnector(staveTop, staveBottom).setType(StaveConnector.type.BOLD_DOUBLE_RIGHT).setContext(context).draw();
        } else {
          new StaveConnector(staveTop, staveBottom).setType(StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();
        }

        // Justificación y dibujo de voces en sus respectivos pentagramas
        new Formatter().joinVoices([voiceTop]).formatToStave([voiceTop], staveTop);
        new Formatter().joinVoices([voiceBottom]).formatToStave([voiceBottom], staveBottom);

        voiceTop.draw(context, staveTop);
        voiceBottom.draw(context, staveBottom);

        const beamsTop = Beam.generateBeams(currentBarTop);
        beamsTop.forEach(b => b.setContext(context).draw());

        const beamsBottom = Beam.generateBeams(currentBarBottom);
        beamsBottom.forEach(b => b.setContext(context).draw());

        // Identificadores para iluminación activa durante la reproducción
        currentBarTop.forEach((note, index) => {
          const el = note.getSVGElement ? note.getSVGElement() : (note.attrs && note.attrs.el);
          if (el) el.id = `vf-top-${i}-${index}`;
        });
        currentBarBottom.forEach((note, index) => {
          const el = note.getSVGElement ? note.getSVGElement() : (note.attrs && note.attrs.el);
          if (el) el.id = `vf-bottom-${i}-${index}`;
        });

        // Avance al siguiente compás o salto a la siguiente línea de sistema
        if (!isLast) {
          if ((i + 1) % measuresPerLine === 0) {
            const nextYTop = staveTop.y + lineHeight;
            const nextYBottom = nextYTop + systemSpacing;
            staveTop = new Stave(systemMargin, nextYTop, measureWidth);
            staveTop.addClef("treble").addKeySignature(activeScale);

            staveBottom = new Stave(systemMargin, nextYBottom, measureWidth);
            staveBottom.addClef("bass").addKeySignature(activeScale);
          } else {
            const nextX = staveTop.x + staveTop.width;
            staveTop = new Stave(nextX, staveTop.y, measureWidth);
            staveBottom = new Stave(nextX, staveBottom.y, measureWidth);
          }
        }
      }
    }

    this.setState({ isSong: true });
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.paintSong(this.props.song, this.props.tempo, this.props.secondVoice);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.song !== this.props.song ||
      prevProps.tempo !== this.props.tempo ||
      prevProps.scale !== this.props.scale ||
      prevProps.secondVoice !== this.props.secondVoice
    ) {
      this.paintSong(this.props.song, this.props.tempo, this.props.secondVoice);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const {
      song,
      secondVoice,
      creationDate,
      tempo,
      activeNote,
      scale,
      onToggleSecondVoice,
      onRegenerateSecondVoice,
    } = this.props;
    const activeScale = scale || CURRENT_SCALE;
    const tonalityName = SCALE_NAMES_ES[activeScale] || activeScale;
    const hasSecondVoice = Boolean(secondVoice && secondVoice.length > 0);

    return (
      <section className="classical-sheet-card">
        {/* Card Header */}
        <div className="sheet-card-header">
          <div className="sheet-title-group">
            <h3 className="sheet-piece-title">
              {hasSecondVoice
                ? `Invención a Dos Voces en ${tonalityName} Mayor`
                : `Improvisación en ${tonalityName} Mayor`}
            </h3>
            <p className="sheet-piece-meta">
              {hasSecondVoice
                ? `Polifonía clásica a dos voces (Contrapunto de Kennan) • ${creationDate} • ${song ? song.length : 0} compases`
                : `Partitura clásica • ${creationDate} • ${song ? song.length : 0} compases`}
            </p>
          </div>

          <div className="sheet-badges">
            {hasSecondVoice && (
              <span className="badge-ready" style={{ borderColor: 'var(--classical-gold)', color: 'var(--classical-burgundy)' }}>
                Polifonía: 2 Voces
              </span>
            )}
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
              Tempo = {tempo} • <em>{hasSecondVoice ? 'Allegretto con spirito • Contrapunctus' : 'Espressivo e Cantabile'}</em>
            </span>
            <span className="paper-instrument-text">
              {hasSecondVoice ? 'Piano a Dos Manos (Mano Derecha e Izquierda)' : 'Piano Solo'}
            </span>
          </div>

          <div id="tab" ref={this.tabRef} className="sheet-svg-container"></div>

          <div className="paper-footer-row">
            <span>
              {hasSecondVoice
                ? `Gran Pentagrama (Clave de Sol y Clave de Fa) • Tonalidad de ${tonalityName} Mayor • Compás de 4/4`
                : `Clave de Sol • Tonalidad de ${tonalityName} Mayor • Compás de 4/4`}
            </span>
            <span>Edición gráfica con VexFlow</span>
          </div>
        </div>

        {/* Counterpoint Actions - Placed RIGHT below the score */}
        <div className="counterpoint-action-area">
          <div className="counterpoint-buttons-row">
            <button
              type="button"
              className={`btn-counterpoint-primary ${hasSecondVoice ? 'active' : ''}`}
              onClick={onToggleSecondVoice}
            >
              <span className="material-symbols-outlined">
                {hasSecondVoice ? 'layers_clear' : 'library_music'}
              </span>
              <span>
                {hasSecondVoice ? 'Quitar Segunda Voz' : 'Añadir Segunda Voz (Contrapunto de Kennan)'}
              </span>
            </button>

            {hasSecondVoice && (
              <button
                type="button"
                className="btn-counterpoint-secondary"
                onClick={onRegenerateSecondVoice}
                title="Generar una nueva variación de contrapunto para esta misma melodía"
              >
                <span className="material-symbols-outlined">cached</span>
                <span>Variación Contrapuntística</span>
              </button>
            )}
          </div>

          {hasSecondVoice && (
            <div className="counterpoint-theory-badge">
              <span className="material-symbols-outlined icon-gold">school</span>
              <div>
                <strong>Contrapunto a 2 Voces según el Tratado de Kent Kennan:</strong>
                <span>
                  {' '}Armonía tonal clara (I - IV/ii - V - I) con cadencia auténtica final. Conducción estricta con movimiento contrario predominante, consonancias imperfectas de 3ª y 6ª en los pulsos armónicos, sin quintas ni octavas paralelas, y bajo en clave de Fa.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default Song;
