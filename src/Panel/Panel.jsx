import React, { Component } from 'react';
import './Panel.css';
import { MAJOR_SCALES } from '../Constants';

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: props.duration || 10,
      speed: props.tempo || 100,
      scale: 'C',
      visualizationType: props.visualizatorType || 'piano',
      showArchitecture: true,
    };

    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleSpeedNudge = this.handleSpeedNudge.bind(this);
    this.handleDurationNudge = this.handleDurationNudge.bind(this);
    this.handleScaleChange = this.handleScaleChange.bind(this);
    this.handleVizChange = this.handleVizChange.bind(this);
    this.handleTriggerGenerate = this.handleTriggerGenerate.bind(this);
    this.toggleArchitecture = this.toggleArchitecture.bind(this);
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

  toggleArchitecture() {
    this.setState((prev) => ({ showArchitecture: !prev.showArchitecture }));
  }

  render() {
    const { isPlaying, handlePlaySong, handleStopSong } = this.props;
    const { speed, duration, scale, visualizationType, showArchitecture } = this.state;

    return (
      <aside className="panel-workstation" id="panel">
        {/* Rack Master Parameter Console */}
        <div className="rack-console">
          {/* Header Row */}
          <div className="rack-console-header">
            <div className="rack-console-title-group">
              <span className="material-symbols-outlined rack-icon">tune</span>
              <h2 className="rack-console-title">Master Parameter Console</h2>
              <span className="rack-id-badge">RACK ID: 0x48A-TONE</span>
            </div>

            <div className="rack-header-actions">
              {/* Visualizer Mode Toggle */}
              <div className="mode-toggle-group">
                <button
                  type="button"
                  className={`mode-btn ${visualizationType === 'piano' ? 'active' : ''}`}
                  onClick={() => this.handleVizChange('piano')}
                >
                  <span className="material-symbols-outlined">piano</span>
                  <span>Piano Deck</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${visualizationType === 'circles' ? 'active' : ''}`}
                  onClick={() => this.handleVizChange('circles')}
                >
                  <span className="material-symbols-outlined">blur_circular</span>
                  <span>Cosmic Circles</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="rack-controls-grid">
            {/* Control 1: Tempo / BPM */}
            <div className="rack-control-bay">
              <div className="bay-header">
                <span className="bay-label">Tempo / Speed</span>
                <div className="bay-telemetry">
                  <span className="telemetry-value-lg text-primary">{speed}</span>
                  <span className="telemetry-unit">BPM</span>
                </div>
              </div>
              <div className="bay-slider-group">
                <button
                  type="button"
                  className="nudge-btn"
                  onClick={() => this.handleSpeedNudge(-5)}
                  title="Decrease 5 BPM"
                >
                  -
                </button>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={speed}
                  onChange={this.handleSpeedChange}
                  className="rack-range-slider"
                  name="speed"
                />
                <button
                  type="button"
                  className="nudge-btn"
                  onClick={() => this.handleSpeedNudge(5)}
                  title="Increase 5 BPM"
                >
                  +
                </button>
              </div>
            </div>

            {/* Control 2: Measures */}
            <div className="rack-control-bay">
              <div className="bay-header">
                <span className="bay-label">Measures (# Bars)</span>
                <span className="telemetry-unit">Length</span>
              </div>
              <div className="bay-stepper-group">
                <span className="telemetry-value-lg text-secondary">{duration}</span>
                <div className="stepper-buttons">
                  <button
                    type="button"
                    className="nudge-btn"
                    onClick={() => this.handleDurationNudge(-1)}
                    title="Remove measure"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
                  </button>
                  <button
                    type="button"
                    className="nudge-btn"
                    onClick={() => this.handleDurationNudge(1)}
                    title="Add measure"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Control 3: Scale */}
            <div className="rack-control-bay">
              <div className="bay-header">
                <span className="bay-label">Diatonic Scale</span>
                <span className="telemetry-unit">Root Mode</span>
              </div>
              <div className="bay-select-wrapper">
                <select
                  name="scale"
                  value={scale}
                  onChange={this.handleScaleChange}
                  className="rack-select"
                >
                  {Object.keys(MAJOR_SCALES).map((s) => (
                    <option value={s} key={s}>
                      {s} Major ({MAJOR_SCALES[s].length} notes)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined select-arrow">expand_more</span>
              </div>
            </div>

            {/* Control 4: Transport & Generation Actions */}
            <div className="rack-actions-bay">
              {/* Play / Stop Button */}
              <button
                type="button"
                className={`transport-btn ${isPlaying ? 'playing' : 'stopped'}`}
                onClick={isPlaying ? handleStopSong : handlePlaySong}
              >
                <span className={`status-indicator-dot ${isPlaying ? 'pulse' : ''}`} />
                <span className="material-symbols-outlined">
                  {isPlaying ? 'stop' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'STOP MELODY' : 'PLAY MELODY'}</span>
              </button>

              {/* Generate Button */}
              <button
                type="button"
                className="generate-ai-btn"
                onClick={this.handleTriggerGenerate}
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                <span>GENERATE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Architecture & Telemetry Section */}
        <div className="architecture-section">
          <button
            type="button"
            className="architecture-toggle-header"
            onClick={this.toggleArchitecture}
          >
            <div className="header-left">
              <span className="material-symbols-outlined text-primary">architecture</span>
              <span className="section-title">Audio Synthesis &amp; Algorithmic Architecture</span>
              <span className="system-tag">SYSTEM SPEC v2.4</span>
            </div>
            <span className="material-symbols-outlined chevron-icon">
              {showArchitecture ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showArchitecture && (
            <div className="architecture-body">
              {/* 4-Bento Bay Grid */}
              <div className="bento-grid">
                <div className="bento-card">
                  <div className="bento-card-header text-primary">
                    <span className="material-symbols-outlined">account_tree</span>
                    <h4>Markov Generation</h4>
                  </div>
                  <p>
                    Employs stochastic pitch matrices constrained to diatonic modes.
                    Evaluates stepwise transitions (82%) vs harmonic leaps (18%) for melodic coherence.
                  </p>
                </div>

                <div className="bento-card">
                  <div className="bento-card-header text-secondary">
                    <span className="material-symbols-outlined">developer_board</span>
                    <h4>Tone.js Core DSP</h4>
                  </div>
                  <p>
                    Precision lookahead Web Audio transport scheduler with sample-accurate event dispatches.
                    Routes through dynamic stereo reverb and limiter busses.
                  </p>
                </div>

                <div className="bento-card">
                  <div className="bento-card-header text-tertiary">
                    <span className="material-symbols-outlined">volume_up</span>
                    <h4>Yamaha C5 Grand</h4>
                  </div>
                  <p>
                    High-resolution 44.1kHz Salamander acoustic grand recorded in stereo with multi-velocity
                    layers and realistic pedal decay resonance.
                  </p>
                </div>

                <div className="bento-card">
                  <div className="bento-card-header text-error">
                    <span className="material-symbols-outlined">auto_stories</span>
                    <h4>VexFlow Engraver</h4>
                  </div>
                  <p>
                    Scalable vector engraver rendering authentic Western musical typography. Synchronizes
                    ticks into staves, stems, beams, and reactive note lighting.
                  </p>
                </div>
              </div>

              {/* Engine Telemetry Strip */}
              <div className="telemetry-strip">
                <div className="telemetry-chip">
                  <span className="chip-label">AudioContext:</span>
                  <span className="chip-value text-primary">Online (44.1kHz)</span>
                </div>
                <div className="telemetry-chip">
                  <span className="chip-label">Engine:</span>
                  <span className="chip-value text-secondary">Salamander Grand</span>
                </div>
                <div className="telemetry-chip">
                  <span className="chip-label">Polyphony:</span>
                  <span className="chip-value text-tertiary">Lookahead Scheduler</span>
                </div>
                <div className="telemetry-chip">
                  <span className="chip-label">Source:</span>
                  <a
                    href="https://github.com/seagomezar/AI-Based-Music-Generator-ReactJS"
                    target="_blank"
                    rel="noreferrer"
                    className="chip-link text-primary"
                  >
                    GitHub Repo
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }
}

export default Panel;