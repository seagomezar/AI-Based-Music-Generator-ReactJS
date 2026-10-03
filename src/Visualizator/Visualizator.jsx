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
        <section className="classical-visualizer-container">
          <Piano />
        </section>
      );
    }

    return (
      <section className="classical-visualizer-container">
        <div className="harmonic-visualizer-card">
          <div className="harmonic-header">
            <div className="harmonic-header-left">
              <span className="material-symbols-outlined text-gold">grain</span>
              <h3 className="harmonic-title">Resonancia Armónica Acústica</h3>
            </div>
            <div className="harmonic-meta">
              {activeNote ? (
                <span className="harmonic-active-pill">
                  Nota Activa: <strong>{activeNote}</strong>
                </span>
              ) : (
                <span className="harmonic-idle-pill">Espacio Armónico</span>
              )}
            </div>
          </div>

          <div className="harmonic-canvas-box">
            {/* Center Classical Emblem */}
            <div className="harmonic-center-orb">
              <span className="material-symbols-outlined orb-icon">music_note</span>
              <span className="orb-text">{activeNote || 'Tonalidad Diatónica'}</span>
            </div>

            {/* Reactive Circles Layer */}
            <svg
              className="harmonic-svg"
              viewBox="0 0 1200 320"
              preserveAspectRatio="xMidYMid meet"
            >
              {this.state.circles}
            </svg>
          </div>

          <div className="harmonic-footer">
            <span>Distribución de frecuencias armónicas</span>
            <span>Muestreo polifónico acústico</span>
          </div>
        </div>
      </section>
    );
  }
}

export default Visualizator;