// Mock for VexFlow to prevent DOM issues in test environments
const fn = typeof vi !== 'undefined' ? vi.fn : jest.fn;

export class Renderer {
  constructor() {
    this.resize = fn();
    this.getContext = fn().mockReturnValue({
      setFont: fn(),
      setFillStyle: fn(),
      setStrokeStyle: fn(),
      scale: fn(),
      clear: fn(),
    });
  }
}
Renderer.Backends = { SVG: 'svg', CANVAS: 'canvas' };

export class Stave {
  constructor(x = 10, y = 40, width = 250) {
    this.width = width;
    this.x = x;
    this.y = y;
  }
  setContext() { return this; }
  draw() { return this; }
  addClef() { return this; }
  addTimeSignature() { return this; }
  addKeySignature() { return this; }
  setTempo() { return this; }
  setEndBarType() { return this; }
}

export class StaveNote {
  constructor() {
    this.attrs = { id: 'mock-id' };
  }
  setContext() { return this; }
  setStave() { return this; }
  draw() { return this; }
  addModifier() { return this; }
  setAttribute() { return this; }
  getSVGElement() { return null; }
}

export class Accidental {
  constructor() {}
}

export const Formatter = {
  FormatAndDraw: fn(),
  SimpleFormat: fn(),
};

export const Beam = {
  generateBeams: fn().mockReturnValue([]),
};

export const Barline = {
  type: {
    END: 'end',
    SINGLE: 'single',
    DOUBLE: 'double',
  },
};

const mockVex = {
  Renderer,
  Stave,
  StaveNote,
  Accidental,
  Formatter,
  Beam,
  Barline,
};

export default mockVex;