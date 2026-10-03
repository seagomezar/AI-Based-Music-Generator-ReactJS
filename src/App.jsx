import React, { Component } from 'react';
import * as Tone from 'tone';
import Panel from './Panel/Panel';
import Song from './Song/Song';
import Visualizator from './Visualizator/Visualizator';
import { generateSong } from './Generators/MusicGenerator';
import { CURRENT_SOUNDS, SALAMANDER_PIANO_SOUNDS, getNotationForPlay, changeScale, CURRENT_SCALE } from './Constants';
import './App.css';
import moment from 'moment';

class App extends Component {
  constructor() {
    super();

    this.state = {
      speed: 100,
      duration: 10,
      generated: false,
      song: [],
      isPlaying: false,
      creationDate: 0,
      visualizatorType: 'piano',
      activeNote: '',
    };

    const baseUrl =
      (import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : import.meta.env.BASE_URL + '/') + 'salamander/';

    this.piano = new Tone.Sampler(SALAMANDER_PIANO_SOUNDS, {
      release: 1.2,
      baseUrl: baseUrl,
    }).toDestination();

    this.handlePlaySong = this.handlePlaySong.bind(this);
    this.bringToTop = this.bringToTop.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
    this.handleStopSong = this.handleStopSong.bind(this);
    this.handleRun = this.handleRun.bind(this);
    this.handleChangeVisualization = this.handleChangeVisualization.bind(this);
  }

  bringToTop(targetElement) {
    if (targetElement && targetElement.parentNode) {
      targetElement.parentNode.appendChild(targetElement);
    }
  }

  componentDidMount() {
    this.handleGenerate();
  }

  handleGenerate() {
    const song = generateSong(this.state.duration);
    this.setState({
      song,
      generated: true,
      creationDate: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss'),
    });
  }

  translateForTone(song) {
    const newSong = [];
    for (let i = 0; i < song.length; i++) {
      let currentTempo = 0;
      const notes = song[i].notes;
      for (let j = 0; j < notes.length; j++) {
        const note = notes[j];
        const sound = CURRENT_SOUNDS[note.sound];
        const duration = getNotationForPlay(note.duration);
        newSong.push({
          time: i + ':' + currentTempo,
          note: sound,
          duration: duration,
          vfId: `vf-${i}-${j}`,
        });
        currentTempo += note.duration;
      }
    }
    return newSong;
  }

  transformElement(element, kind, note) {
    if (kind === 'circles') {
      this.bringToTop(element);
      const color = element.getAttribute('data-color') || '#b3822a';
      const originalRadius = Number(element.getAttribute('r')) || 15;
      element.style.fill = color;
      element.style.opacity = '0.9';
      element.style.r = `${originalRadius + 5}`;
      element.style.transition = 'all 0.35s ease';
      setTimeout(() => {
        element.style.fill = '#948c7d';
        element.style.opacity = '0.35';
        element.style.r = `${originalRadius}`;
        element.style.transition = 'all 0.35s ease';
      }, 400);
    } else {
      if (~note.indexOf('#')) {
        element.classList.add('black-pressed');
      } else {
        element.classList.add('white-pressed');
      }
      setTimeout(() => {
        element.classList.remove('black-pressed');
        element.classList.remove('white-pressed');
      }, 400);
    }
  }

  async handlePlaySong() {
    await Tone.start();
    const song = this.translateForTone(this.state.song);
    Tone.Transport.cancel();
    Tone.Transport.clear();

    new Tone.Part((time, event) => {
      this.piano.triggerAttackRelease(event.note, event.duration, time);
      Tone.Draw.schedule(() => {
        this.setState({ activeNote: event.note });

        // Highlight element on visualizer
        const element = document.getElementById(event.note);
        if (element) {
          this.transformElement(element, this.state.visualizatorType, event.note);
        }

        // Highlight note in sheet music
        const noteElement = document.getElementById(event.vfId);
        if (noteElement) {
          noteElement.classList.add('note-highlight');
          const durationMs = Tone.Time(event.duration).toSeconds() * 1000;
          setTimeout(() => {
            noteElement.classList.remove('note-highlight');
          }, durationMs);
        }
      }, time);
    }, song).start();

    Tone.Transport.bpm.rampTo(this.state.speed);
    Tone.Transport.start();
    this.setState({ isPlaying: true });
  }

  handleStopSong() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.clear();
    this.setState({ isPlaying: false, activeNote: '' });
  }

  handleRun(speed, duration, scale) {
    this.handleStopSong();
    changeScale(scale);
    this.setState(
      {
        duration,
        speed,
        song: [],
      },
      () => {
        this.handleGenerate();
      }
    );
  }

  handleChangeVisualization(type) {
    this.setState({ visualizatorType: type });
  }

  render() {
    const { speed, duration, song, isPlaying, creationDate, visualizatorType, activeNote } =
      this.state;

    return (
      <div className="classical-app-root">
        {/* Classical Header Navigation */}
        <header className="classical-navbar">
          <div className="navbar-content">
            <div className="brand-classical">
              <div className="clef-emblem">
                <svg viewBox="0 0 40 40" className="clef-svg" fill="currentColor">
                  <circle cx="20" cy="20" r="18" fill="#fdfbf7" stroke="#c9a44c" strokeWidth="1.5" />
                  <path
                    d="M19.5 28c-1.8 0-3.2-.8-4.1-2.3-.9-1.5-1.1-3.4-.6-5.5.5-2 1.5-4 2.9-5.8 1.3-1.7 3-3.2 4.9-4.5.5-.4 1-.7 1.6-1.1-.4-2.5-.9-5.9-1.3-8.8 0-1.6.4-3 1.3-4 1-1 2.2-1.5 3.8-1.5 1.5 0 2.6.4 3.5 1.2.8.8 1.2 2 1.2 3.3 0 1.8-.6 4.1-1.8 6.8-1.1 2.5-2.6 5.3-4.1 8l1.1 8.3c1.1-.5 2.2-.8 3.3-.8 2.7 0 5.1 1.1 6.9 3.1 1.7 2 2.6 4.6 2.4 7.4-.2 2.9-1.5 5.6-3.6 7.5-2.2 1.9-4.9 2.9-7.9 2.8-2.5 0-4.8-.8-6.5-2.3l-.9 6.9c-.4 3-1.1 5.5-2.3 7.1-1.2 1.6-2.8 2.5-4.7 2.5-1.6 0-2.8-.5-3.7-1.5-.9-1-1.4-2.3-1.4-3.8 0-1.8.7-3.3 1.9-4.4 1.2-1 2.7-1.6 4.4-1.6.6 0 1.1.1 1.6.3-.1.9-.2 1.7-.2 2.3 0 1.3.2 2.3.7 3 .5.6 1.1.9 2 .9 1.2 0 2.1-.7 2.8-2 .7-1.3 1.1-3.4 1.3-6l1.3-9.5c-1.8 1-3.6 1.7-5.5 1.7z"
                    transform="translate(-6, -4) scale(0.65)"
                    fill="#7a1f2d"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <h1 className="brand-heading">Atelier de Música Clásica</h1>
                <p className="brand-caption">
                  Composición Algorítmica Inspirada en el Clasicismo Vienés
                </p>
              </div>
            </div>

            {/* Quick Status / Actions */}
            <div className="navbar-quick-controls">
              <div className="status-pill">
                <span className="pill-dot" />
                <span className="pill-label">Tempo:</span>
                <span className="pill-value">{speed} BPM</span>
              </div>

              {activeNote && (
                <div className="status-pill active-note-pill">
                  <span className="pill-label">Sonando:</span>
                  <span className="pill-value highlight">{activeNote}</span>
                </div>
              )}

              <button
                type="button"
                className={`btn-classical-transport ${isPlaying ? 'is-playing' : ''}`}
                onClick={isPlaying ? this.handleStopSong : this.handlePlaySong}
                title={isPlaying ? 'Detener interpretación' : 'Interpretar melodía'}
              >
                <span className="material-symbols-outlined">
                  {isPlaying ? 'stop' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Detener' : 'Interpretar'}</span>
              </button>

              <button
                type="button"
                className="btn-classical-compose"
                onClick={() => this.handleRun(speed, duration, CURRENT_SCALE)}
                title="Generar nueva melodía clásica"
              >
                <span className="material-symbols-outlined">music_note</span>
                <span>Componer</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Classical Salon Banner */}
        <div className="classical-hero-banner">
          <div className="hero-overlay">
            <div className="hero-text-content">
              <span className="hero-tradition-tag">Música Clásica • 1750–1820</span>
              <h2 className="hero-quote">
                «La música no debe ofender jamás al oído, sino deleitarlo constantemente»
              </h2>
              <p className="hero-attribution">— Wolfgang Amadeus Mozart</p>
            </div>
          </div>
        </div>

        {/* Main Composition Canvas */}
        <main className="classical-main-container">
          {/* Panel de Ajustes y Parámetros */}
          <Panel
            tempo={speed}
            duration={duration}
            isPlaying={isPlaying}
            visualizatorType={visualizatorType}
            handleRun={this.handleRun}
            handlePlaySong={this.handlePlaySong}
            handleStopSong={this.handleStopSong}
            handleChangeVisualization={this.handleChangeVisualization}
          />

          {/* Partitura Clásica */}
          {song && song.length > 0 ? (
            <Song
              song={song}
              creationDate={creationDate}
              tempo={speed}
              activeNote={activeNote}
              handlePlaySong={this.handlePlaySong}
            />
          ) : (
            <div className="sheet-loading-card">
              <span className="material-symbols-outlined loading-spin">hourglass_top</span>
              <p>Grabando la partitura musical...</p>
            </div>
          )}

          {/* Visualizador de Piano Acústico Tradicional */}
          <Visualizator type={visualizatorType} activeNote={activeNote} />
        </main>

        {/* Classical Footer */}
        <footer className="classical-footer">
          <div className="footer-content">
            <p className="footer-title">Atelier de Música Clásica</p>
            <p className="footer-desc">
              Composición musical estocástica con modelos de transición armónica basada en la época clásica.
              Audio sintetizado con muestras de alta resolución de piano acústico Salamander y notación vectorial VexFlow.
            </p>
            <div className="footer-links">
              <a
                href="https://github.com/seagomezar/AI-Based-Music-Generator-ReactJS"
                target="_blank"
                rel="noreferrer"
              >
                Código en GitHub
              </a>
              <span>•</span>
              <a href="https://musical-artifacts.com/artifacts/3" target="_blank" rel="noreferrer">
                Salamander Grand Piano
              </a>
              <span>•</span>
              <a href="https://tonejs.github.io/" target="_blank" rel="noreferrer">
                Tone.js
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
