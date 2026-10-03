import React, { Component } from 'react';
import { generateAllNotes } from '../Generators/MusicGenerator';
import { generateCircle } from '../Generators/VisualGenerator';
import Piano from '../Piano/Piano';
import './Visualizator.css';

class Visualizator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      circles: [],
    };
    this.addCircles = this.addCircles.bind(this);
  }

  addCircles(notesToAdd) {
    const circles = [];
    for (let i = 0; i < notesToAdd.length; i++) {
      const circle = generateCircle(notesToAdd[i]);
      circles.push(circle);
    }
    this.setState({ circles });
  }

  componentDidMount() {
    const allNotes = generateAllNotes();
    this.addCircles(allNotes);
  }

  render() {
    const { type, activeNote } = this.props;

    if (type !== 'circles') {
      return (
        <section className="visualizer-stage-card">
          <Piano />
        </section>
      );
    }

    return (
      <section className="visualizer-stage-card">
        <div className="visualizer-header">
          <div className="visualizer-header-title">
            <span className="material-symbols-outlined text-secondary">blur_circular</span>
            <span className="title-text">Harmonic Resonance Orbit (Cosmic Mode)</span>
          </div>
          <div className="visualizer-telemetry">
            <span className="telemetry-pill">FFT: 512 Bands</span>
            {activeNote && (
              <span className="telemetry-pill active">Resonance: {activeNote}</span>
            )}
          </div>
        </div>

        <div className="cosmic-canvas-frame">
          {/* Orbital Ambient Rings */}
          <div className="orbital-ring ring-outer" />
          <div className="orbital-ring ring-mid" />
          <div className="orbital-ring ring-inner" />

          {/* Center Singularity Core */}
          <div className="cosmic-center-core">
            <div className="core-icon-orb">
              <span className="material-symbols-outlined text-white">graphic_eq</span>
            </div>
            <span className="core-label">{activeNote || 'Resonance Core'}</span>
          </div>

          {/* Floating Lissajous Sine Wave line */}
          <svg className="cosmic-lissajous-wave" viewBox="0 0 1200 320" preserveAspectRatio="none">
            <path
              d="M 0,160 Q 300,40 600,160 T 1200,160"
              fill="none"
              stroke="rgba(76, 215, 246, 0.25)"
              strokeWidth="2"
            />
            <path
              d="M 0,160 Q 300,280 600,160 T 1200,160"
              fill="none"
              stroke="rgba(221, 183, 255, 0.25)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Interactive Reactive Circles SVG Layer */}
          <svg
            className="cosmic-circles-svg"
            viewBox="0 0 1200 320"
            preserveAspectRatio="xMidYMid meet"
          >
            {this.state.circles}
          </svg>
        </div>

        <div className="visualizer-footer">
          <span>Mode: Diatonic Particle Distribution</span>
          <span className="text-secondary">Spatial Resonance Spectrum • 36 Nodes</span>
        </div>
      </section>
    );
  }
}

export default Visualizator;