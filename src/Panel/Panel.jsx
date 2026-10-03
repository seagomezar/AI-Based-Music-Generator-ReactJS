import React, { Component } from 'react';
import './Panel.css';
import { MAJOR_SCALES } from '../Constants';

// Classical tempo descriptors
function getClassicalTempoMarking(bpm) {
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 132) return 'Moderato';
  if (bpm < 168) return 'Allegro';
  return 'Presto';
}

const SCALE_NAMES_ES = {
  'C': 'Do Mayor (C)',
  'D': 'Re Mayor (D)',
  'E': 'Mi Mayor (E)',
  'F': 'Fa Mayor (F)',
  'G': 'Sol Mayor (G)',
  'A': 'La Mayor (A)',
  'B': 'Si Mayor (B)',
  'F#': 'Fa# Mayor (F#)',
};

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: props.duration || 10,
      speed: props.tempo || 100,
      scale: 'C',
      visualizationType: props.visualizatorType || 'piano',
      showTheory: false,
    };

    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleSpeedNudge = this.handleSpeedNudge.bind(this);
    this.handleDurationNudge = this.handleDurationNudge.bind(this);
    this.handleScaleChange = this.handleScaleChange.bind(this);
    this.handleVizChange = this.handleVizChange.bind(this);
    this.handleTriggerGenerate = this.handleTriggerGenerate.bind(this);
    this.toggleTheory = this.toggleTheory.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tempo !== this.props.tempo) {
      this.setState({ speed: this.props.tempo });
    }
    if (prevProps.duration !== this.props.duration) {
      this.setState({ duration: this.props.duration });
    }
    if (prevProps.visualizatorType !== this.props.visualizatorType) {
      this.setState({ visualizationType: this.props.visualizatorType });
    }
  }

  handleSpeedChange(e) {
    const speed = Math.max(40, Math.min(220, Number(e.target.value)));
    this.setState({ speed });
  }

  handleSpeedNudge(delta) {
    this.setState((prev) => ({
      speed: Math.max(40, Math.min(220, prev.speed + delta)),
    }));
  }

  handleDurationNudge(delta) {
    this.setState((prev) => ({
      duration: Math.max(4, Math.min(24, prev.duration + delta)),
    }));
  }

  handleScaleChange(e) {
    this.setState({ scale: e.target.value });
  }

  handleVizChange(type) {
    this.setState({ visualizationType: type });
    if (this.props.handleChangeVisualization) {
      this.props.handleChangeVisualization(type);
    }
  }

  handleTriggerGenerate() {
    this.props.handleRun(this.state.speed, this.state.duration, this.state.scale);
  }

  toggleTheory() {
    this.setState((prev) => ({ showTheory: !prev.showTheory }));
  }

  render() {
    const { isPlaying, handlePlaySong, handleStopSong } = this.props;
    const { speed, duration, scale, visualizationType, showTheory } = this.state;
    const tempoMarking = getClassicalTempoMarking(speed);

    return (
      <section className="classical-panel-section" id="panel">
        <div className="classical-panel-card">
          {/* Card Header */}
          <div className="panel-card-header">
            <div className="header-title-box">
              <span className="material-symbols-outlined icon-classical">tune</span>
              <h2 className="panel-title">Ajustes de Composición Musical</h2>
            </div>
            
            {/* Visualizer Mode Switcher */}
            <div className="classical-view-selector">
              <span className="view-label">Vista:</span>
              <div className="view-tabs">
                <button
                  type="button"
                  className={`view-tab-btn ${visualizationType === 'piano' ? 'selected' : ''}`}
                  onClick={() => this.handleVizChange('piano')}
                >
                  <span className="material-symbols-outlined">piano</span>
                  <span>Piano de Cola</span>
                </button>
                <button
                  type="button"
                  className={`view-tab-btn ${visualizationType === 'circles' ? 'selected' : ''}`}
                  onClick={() => this.handleVizChange('circles')}
                >
                  <span className="material-symbols-outlined">grain</span>
                  <span>Círculos Armónicos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="classical-controls-row">
            {/* Control 1: Tempo / BPM */}
            <div className="classical-control-item">
              <label htmlFor="speed-slider" className="control-label">
                Tempo (Velocidad)
              </label>
              <div className="tempo-display">
                <span className="tempo-number">{speed}</span>
                <span className="tempo-units">BPM</span>
                <span className="tempo-italian">({tempoMarking})</span>
              </div>
              <div className="slider-container">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => this.handleSpeedNudge(-5)}
                  title="Disminuir 5 BPM"
                >
                  -
                </button>
                <input
                  id="speed-slider"
                  type="range"
                  min="40"
                  max="220"
                  value={speed}
                  onChange={this.handleSpeedChange}
                  className="classical-slider"
                  name="speed"
                />
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => this.handleSpeedNudge(5)}
                  title="Aumentar 5 BPM"
                >
                  +
                </button>
              </div>
            </div>

            {/* Control 2: Measures */}
            <div className="classical-control-item">
              <label className="control-label">Compases</label>
              <div className="measures-display">
                <span className="measures-number">{duration}</span>
                <span className="measures-tag">compases</span>
              </div>
              <div className="measures-stepper">
                <button
                  type="button"
                  className="measures-btn"
                  onClick={() => this.handleDurationNudge(-1)}
                  title="Menos compases"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <button
                  type="button"
                  className="measures-btn"
                  onClick={() => this.handleDurationNudge(1)}
                  title="Más compases"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            {/* Control 3: Scale */}
            <div className="classical-control-item">
              <label htmlFor="scale-select" className="control-label">
                Tonalidad Clásica
              </label>
              <div className="select-wrapper">
                <select
                  id="scale-select"
                  name="scale"
                  value={scale}
                  onChange={this.handleScaleChange}
                  className="classical-select"
                >
                  {Object.keys(MAJOR_SCALES).map((s) => (
                    <option value={s} key={s}>
                      {SCALE_NAMES_ES[s] || `${s} Mayor`}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined arrow-icon">unfold_more</span>
              </div>
            </div>

            {/* Control 4: Action Buttons */}
            <div className="classical-action-box">
              <button
                type="button"
                className={`btn-panel-action btn-play ${isPlaying ? 'playing' : ''}`}
                onClick={isPlaying ? handleStopSong : handlePlaySong}
              >
                <span className="material-symbols-outlined">
                  {isPlaying ? 'stop' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Detener' : 'Interpretar'}</span>
              </button>

              <button
                type="button"
                className="btn-panel-action btn-compose"
                onClick={this.handleTriggerGenerate}
              >
                <span className="material-symbols-outlined">music_note</span>
                <span>Componer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Educational Accordion */}
        <div className="classical-theory-card">
          <button
            type="button"
            className="theory-toggle-header"
            onClick={this.toggleTheory}
          >
            <div className="theory-header-left">
              <span className="material-symbols-outlined text-gold">menu_book</span>
              <span className="theory-title">Fundamentos del Proyecto y Teoría Musical</span>
            </div>
            <span className="material-symbols-outlined chevron">
              {showTheory ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showTheory && (
            <div className="theory-body">
              <div className="theory-grid">
                <div className="theory-column">
                  <h3>Composición Algorítmica</h3>
                  <p>
                    El algoritmo genera secuencias melódicas basadas en matrices de probabilidad diatónica.
                    Privilegia el movimiento por grados conjuntos frente a los saltos interválicos, respetando
                    la cadencia melódica característica del clasicismo de finales del siglo XVIII.
                  </p>
                </div>
                <div className="theory-column">
                  <h3>Piano de Concierto Salamander</h3>
                  <p>
                    Las muestras acústicas provienen del banco de sonido <em>Salamander Grand Piano</em>,
                    grabado en estéreo a 44.1 kHz sobre un piano de cola Yamaha C5 con diferentes capas de
                    dinámica e interacción del pedal apagador.
                  </p>
                </div>
                <div className="theory-column">
                  <h3>Notación Editorial con VexFlow</h3>
                  <p>
                    La partitura en pantalla se graba vectorialmente en tiempo real mediante <em>VexFlow</em>,
                    organizando las notas, barras de compás, claves, armaduras y ligaduras conforme a los
                    cánones tradicionales de la tipografía musical.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default Panel;