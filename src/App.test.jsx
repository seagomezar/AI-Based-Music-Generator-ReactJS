import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { it, vi } from 'vitest';
import './App.css';
import App from './App';

// Mock tone.js and vexflow to prevent test issues
vi.mock('tone', () => import('./__mocks__/tone.js'));
vi.mock('vexflow', () => import('./__mocks__/vexflow.js'));

it('renders without crashing', async () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  await act(async () => {
    root.render(<App />);
  });
});
