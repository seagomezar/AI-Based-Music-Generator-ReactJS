import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App';

// Mock tone.js and vexflow to prevent test issues
jest.mock('tone');
jest.mock('vexflow');

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<App />);
});
