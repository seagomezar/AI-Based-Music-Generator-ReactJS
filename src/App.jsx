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

    // Set initial state
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

    // Set the piano instrument
    const baseUrl =
      (import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : import.meta.env.BASE_URL + '/') + 'salamander/';

    this.piano = new Tone.Sampler(SALAMANDER_PIANO_SOUNDS, {
      release: 1,
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
      creationDate: moment(Date.now()).format('DD-MMM-YY HH:mm:ss'),
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
      const color = element.getAttribute('data-color') || '#4cd7f6';
      const originalRadius = Number(element.getAttribute('r')) || 15;
      element.style.fill = color;
      element.style.opacity = '1';
      element.style.r = `${originalRadius + 6}`;
      element.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        element.style.fill = '#ffffff';
        element.style.opacity = '0.35';
        element.style.r = `${originalRadius}`;
        element.style.transition = 'all 0.4s ease';
      }, 450);
    } else {
      if (~note.indexOf('#')) {
        element.classList.add('black-pressed');
      } else {
        element.classList.add('white-pressed');
      }
      setTimeout(() => {
        element.classList.remove('black-pressed');
        element.classList.remove('white-pressed');
      }, 450);
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
        // Set active note in state for telemetry badges
        this.setState({ activeNote: event.note });

        // 1. Visualizator Circle or Piano Key Highlight
        const element = document.getElementById(event.note);
        if (element) {
          this.transformElement(element, this.state.visualizatorType, event.note);
        }

        // 2. Sheet Music Note Highlight
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
      <div className="studio-root">
        {/* Top Studio Workstation Navbar */}
        <header className="studio-topbar">
          <div className="topbar-inner">
            {/* Brand Anchor */}
            <div className="brand-group">
              <div className="brand-icon-box">
                <span className="material-symbols-outlined text-primary">graphic_eq</span>
              </div>
              <div className="brand-text-col">
                <span className="brand-title">AI Music Studio</span>
                <span className="brand-subtitle">
                  Algorithmic Melody Composer • Tone.js &amp; VexFlow
                </span>
              </div>
            </div>

            {/* Global Telemetry Badges */}
            <div className="telemetry-badges-group">
              <div className="topbar-chip">
                <span className="telemetry-live-dot" />
                <span className="chip-dim">Tempo:</span>
                <span className="chip-highlight">{speed} BPM</span>
              </div>

              <div className="topbar-chip hidden-sm">
                <span className="chip-dim">Engine:</span>
                <span className="chip-val text-secondary">Salamander Grand 44.1kHz</span>
              </div>

              {activeNote && (
                <div className="topbar-chip active-voice-chip">
                  <span className="live-error-dot" />
                  <span className="chip-dim">Active Voice:</span>
                  <span className="chip-highlight-error">{activeNote}</span>
                </div>
              )}
            </div>

            {/* Quick Actions in Navbar */}
            <div className="topbar-actions">
              <button
                type="button"
                className={`topbar-transport-btn ${isPlaying ? 'playing' : ''}`}
                onClick={isPlaying ? this.handleStopSong : this.handlePlaySong}
                title={isPlaying ? 'Stop Melody Playback' : 'Start Melody Playback'}
              >
                <span className="material-symbols-outlined">
                  {isPlaying ? 'stop' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Stop' : 'Play'}</span>
              </button>

              <button
                type="button"
                className="topbar-generate-btn"
                onClick={() => this.handleRun(speed, duration, CURRENT_SCALE)}
                title="Generate New Algorithmic Melody"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                <span>Generate</span>
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Canvas Container */}
        <main className="studio-main-content">
          {/* Master Parameter Console */}
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

          {/* Sheet Music Score Stage */}
          {song && song.length > 0 ? (
            <Song
              song={song}
              creationDate={creationDate}
              tempo={speed}
              activeNote={activeNote}
              handlePlaySong={this.handlePlaySong}
            />
          ) : (
            <div className="score-loading-card">
              <span className="material-symbols-outlined spin-icon">progress_activity</span>
              <span>Engraving Algorithmic Sheet Music...</span>
            </div>
          )}

          {/* Dual-Mode Visualizer Stage */}
          <Visualizator type={visualizatorType} activeNote={activeNote} />
        </main>
      </div>
    );
  }
}

export default App;
