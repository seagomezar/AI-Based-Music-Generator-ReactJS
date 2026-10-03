import React, { Component } from 'react';
import { ALL_FULL_NOTES } from '../Constants';
import './Piano.css';

class Piano extends Component {
  constructor(props) {
    super(props);
    this.pianoRef = React.createRef();
    this.renderKeys = this.renderKeys.bind(this);
  }

  componentDidMount() {
    this.renderKeys();
    window.addEventListener('resize', this.renderKeys);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.renderKeys);
  }

  renderKeys() {
    const piano = this.pianoRef.current || document.getElementById('piano');
    if (!piano) return;

    piano.innerHTML = '';
    const containerWidth = piano.parentElement ? piano.parentElement.clientWidth : window.innerWidth;
    const height = 125;

    // Filter white notes to count total white keys
    const whiteNotesCount = ALL_FULL_NOTES.filter((n) => !n.includes('#')).length;
    const keyWidth = Math.max(16, (containerWidth - 24) / whiteNotesCount);
    const blackWidth = keyWidth * 0.65;

    for (let i = 0; i < ALL_FULL_NOTES.length; i++) {
      const currentNote = ALL_FULL_NOTES[i];
      const isBlack = currentNote.includes('#');
      const node = document.createElement('li');
      node.setAttribute('id', currentNote);

      if (isBlack) {
        node.className = 'black';
        node.style.height = `${height * 0.62}px`;
        node.style.width = `${blackWidth}px`;
        node.style.marginLeft = `-${blackWidth / 2}px`;
        node.style.marginRight = `-${blackWidth / 2}px`;
      } else {
        node.className = 'white';
        node.style.height = `${height}px`;
        node.style.width = `${keyWidth}px`;
      }

      if (currentNote.startsWith('C') && !isBlack) {
        const label = document.createElement('span');
        label.className = 'key-label';
        label.innerText = currentNote;
        node.appendChild(label);
      }

      piano.appendChild(node);
    }
  }

  render() {
    return (
      <div className="classical-piano-wrapper">
        <div className="piano-wood-header">
          <div className="header-left">
            <span className="material-symbols-outlined text-gold">piano</span>
            <span className="piano-header-title">Piano de Cola Acústico</span>
          </div>
          <span className="piano-header-meta">Teclado de 73 Teclas (C1 – C7)</span>
        </div>

        <div className="piano-case">
          <div className="piano-brass-fallboard" />
          <div className="piano-keybed-scroll">
            <ul id="piano" ref={this.pianoRef} className="piano-keys-list" />
          </div>
          <div className="piano-lower-lip">
            <span>Muestras acústicas Yamaha C5 • 44.1 kHz Estéreo</span>
            <span>Resonancia natural y pedal apagador</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Piano;