import React, { Component } from 'react';
import Tone from '../mocks/tone';
import Panel from './Panel/Panel';
import Song from './Song/Song';
import Visualizator from './Visualizator/Visualizator';
import { generateSong } from './Generators/MusicGenerator';
import { CURRENT_SOUNDS, SALAMANDER_PIANO_SOUNDS, getNotationForPlay, changeScale } from './Constants';
import './App.css';
import moment from 'moment';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
