import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import * as Tone from 'tone';
import * as Vex from 'vexflow';

vi.mock('tone', () => import('../__mocks__/tone.js'));
vi.mock('vexflow', () => import('../__mocks__/vexflow.js'));

describe('End-to-End User Flows: Ground Truth Functional Testing', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      if (root) root.unmount();
    });
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  it('Flow 1: mounts the complete application and verifies initial ground truth state', async () => {
    await act(async () => {
      root.render(<App />);
    });

    // 1. Verify Classical Brand Navbar
    const heading = container.querySelector('.brand-heading');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toContain('Atelier de Música Clásica');

    const tempoPill = container.querySelector('.status-pill .pill-value');
    expect(tempoPill).not.toBeNull();
    expect(tempoPill.textContent).toContain('100 BPM');

    // 2. Verify Transport & Compose Navbar buttons
    const transportBtn = container.querySelector('.btn-classical-transport');
    expect(transportBtn).not.toBeNull();
    expect(transportBtn.textContent).toContain('Interpretar');

    const composeBtn = container.querySelector('.btn-classical-compose');
    expect(composeBtn).not.toBeNull();
    expect(composeBtn.textContent).toContain('Componer');

    // 3. Verify Sheet Card & Paper
    const sheetTitle = container.querySelector('.sheet-piece-title');
    expect(sheetTitle).not.toBeNull();
    expect(sheetTitle.textContent).toContain('Mayor');

    // 4. Verify Counterpoint Action Button is placed right below the sheet
    const counterpointBtn = container.querySelector('.btn-counterpoint-primary');
    expect(counterpointBtn).not.toBeNull();
    expect(counterpointBtn.textContent).toContain('Añadir Segunda Voz (Contrapunto de Kennan)');

    // 5. Verify Visualizer defaults to Acoustic Grand Piano
    const pianoWrapper = container.querySelector('.classical-piano-wrapper');
    expect(pianoWrapper).not.toBeNull();
  });

  it('Flow 2: allows user to adjust composition parameters (tempo, duration, scale)', async () => {
    let appInstance = null;
    await act(async () => {
      root.render(
        <App
          ref={(inst) => {
            appInstance = inst;
          }}
        />
      );
    });

    expect(appInstance).not.toBeNull();

    // User changes tempo to 120 BPM, duration to 8 measures, and scale to 'B'
    await act(async () => {
      appInstance.handleRun(120, 8, 'B');
    });

    expect(appInstance.state.speed).toBe(120);
    expect(appInstance.state.duration).toBe(8);
    expect(appInstance.state.scale).toBe('B');
    expect(appInstance.state.song.length).toBe(8);

    // Navbar pill reflects new tempo
    const tempoPill = container.querySelector('.status-pill .pill-value');
    expect(tempoPill.textContent).toContain('120 BPM');

    // Piece title reflects new tonality
    const sheetTitle = container.querySelector('.sheet-piece-title');
    expect(sheetTitle.textContent).toContain('Si Mayor');
  });

  it('Flow 3: user composes a new melody, resetting second voice cleanly', async () => {
    let appInstance = null;
    await act(async () => {
      root.render(
        <App
          ref={(inst) => {
            appInstance = inst;
          }}
        />
      );
    });

    // First, user adds second voice
    await act(async () => {
      appInstance.handleToggleSecondVoice();
    });
    expect(appInstance.state.secondVoice).not.toBeNull();

    // Now, user clicks "Componer" to generate a fresh melody
    await act(async () => {
      appInstance.handleGenerate();
    });

    // Song must be regenerated and second voice must be cleanly reset to null
    expect(appInstance.state.song.length).toBe(appInstance.state.duration);
    expect(appInstance.state.secondVoice).toBeNull();

    const counterpointBtn = container.querySelector('.btn-counterpoint-primary');
    expect(counterpointBtn.textContent).toContain('Añadir Segunda Voz (Contrapunto de Kennan)');
  });

  it('Flow 4: user adds a second voice, views Grand Staff, and generates variations', async () => {
    let appInstance = null;
    await act(async () => {
      root.render(
        <App
          ref={(inst) => {
            appInstance = inst;
          }}
        />
      );
    });

    // Find the Add Second Voice button in DOM and simulate user click
    const counterpointBtn = container.querySelector('.btn-counterpoint-primary');
    expect(counterpointBtn).not.toBeNull();

    await act(async () => {
      counterpointBtn.click();
    });

    // State assertion: secondVoice is now populated
    expect(appInstance.state.secondVoice).not.toBeNull();
    expect(appInstance.state.secondVoice.length).toBe(appInstance.state.song.length);

    // DOM assertions after enabling second voice:
    // 1. Title updates to two-voice invention
    const sheetTitle = container.querySelector('.sheet-piece-title');
    expect(sheetTitle.textContent).toContain('Invención a Dos Voces');

    // 2. Primary button changes to "Quitar Segunda Voz"
    expect(counterpointBtn.textContent).toContain('Quitar Segunda Voz');

    // 3. Secondary button "Variación Contrapuntística" appears
    const variationBtn = container.querySelector('.btn-counterpoint-secondary');
    expect(variationBtn).not.toBeNull();
    expect(variationBtn.textContent).toContain('Variación Contrapuntística');

    // 4. Theory educational badge appears
    const theoryBadge = container.querySelector('.counterpoint-theory-badge');
    expect(theoryBadge).not.toBeNull();
    expect(theoryBadge.textContent).toContain('Kent Kennan');

    // 5. User clicks "Variación Contrapuntística"
    await act(async () => {
      variationBtn.click();
    });

    expect(appInstance.state.secondVoice).not.toBeNull();
    expect(appInstance.state.secondVoice.length).toBe(appInstance.state.song.length);

    // 6. User clicks "Quitar Segunda Voz" to return to solo melody
    await act(async () => {
      counterpointBtn.click();
    });

    expect(appInstance.state.secondVoice).toBeNull();
    expect(sheetTitle.textContent).toContain('Improvisación');
    expect(container.querySelector('.btn-counterpoint-secondary')).toBeNull();
    expect(container.querySelector('.counterpoint-theory-badge')).toBeNull();
  });

  it('Flow 5: user toggles visualization between Piano and Harmonic Circles', async () => {
    let appInstance = null;
    await act(async () => {
      root.render(
        <App
          ref={(inst) => {
            appInstance = inst;
          }}
        />
      );
    });

    // Initially Piano
    expect(container.querySelector('.classical-piano-wrapper')).not.toBeNull();
    expect(container.querySelector('.harmonic-visualizer-card')).toBeNull();

    // User switches to Harmonic Circles
    await act(async () => {
      appInstance.handleChangeVisualization('circles');
    });

    expect(container.querySelector('.classical-piano-wrapper')).toBeNull();
    const circlesCard = container.querySelector('.harmonic-visualizer-card');
    expect(circlesCard).not.toBeNull();
    expect(circlesCard.textContent).toContain('Resonancia Armónica Acústica');

    // User switches back to Piano
    await act(async () => {
      appInstance.handleChangeVisualization('piano');
    });

    expect(container.querySelector('.classical-piano-wrapper')).not.toBeNull();
    expect(container.querySelector('.harmonic-visualizer-card')).toBeNull();
  });

  it('Flow 6: user plays and stops song with polyphonic event translation and visual feedback', async () => {
    let appInstance = null;
    await act(async () => {
      root.render(
        <App
          ref={(inst) => {
            appInstance = inst;
          }}
        />
      );
    });

    // Add second voice for polyphonic playback testing
    await act(async () => {
      appInstance.handleToggleSecondVoice();
    });

    // User clicks "Interpretar"
    await act(async () => {
      await appInstance.handlePlaySong();
    });

    // State reflects playing
    expect(appInstance.state.isPlaying).toBe(true);

    // Transport button in navbar now displays "Detener"
    const transportBtn = container.querySelector('.btn-classical-transport');
    expect(transportBtn.textContent).toContain('Detener');

    // Simulate note event visualizer animation
    const sampleEvent = {
      note: 'C3',
      canonicalNote: 'C3',
      duration: '2n',
      vfId: 'vf-bottom-0-0',
    };

    // Create mock DOM elements for visualizer and sheet music note
    const mockPianoKey = document.createElement('li');
    mockPianoKey.id = 'C3';
    container.appendChild(mockPianoKey);

    const mockNoteSvg = document.createElement('div');
    mockNoteSvg.id = 'vf-bottom-0-0';
    container.appendChild(mockNoteSvg);

    // Trigger visualizer animation
    appInstance.transformElement(mockPianoKey, 'piano', 'C3');
    expect(mockPianoKey.classList.contains('white-pressed')).toBe(true);

    // User clicks "Detener"
    await act(async () => {
      appInstance.handleStopSong();
    });

    expect(appInstance.state.isPlaying).toBe(false);
    expect(appInstance.state.activeNote).toBe('');
    expect(transportBtn.textContent).toContain('Interpretar');
  });
});
