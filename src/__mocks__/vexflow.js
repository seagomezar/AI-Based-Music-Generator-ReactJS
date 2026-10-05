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

export class Voice {
  constructor() {
    this.addTickables = fn().mockReturnValue(this);
    this.setMode = fn().mockReturnValue(this);
    this.draw = fn().mockReturnValue(this);
  }
}
Voice.Mode = { STRICT: 1, SOFT: 2, FULL: 3 };

export class Accidental {
  constructor() {}
  static applyAccidentals = fn();
}

export class StaveConnector {
  constructor() {
    this.setType = fn().mockReturnValue(this);
    this.setContext = fn().mockReturnValue(this);
    this.draw = fn().mockReturnValue(this);
  }
}
StaveConnector.type = {
  SINGLE_RIGHT: 0,
  SINGLE_LEFT: 1,
  SINGLE: 1,
  DOUBLE: 2,
  BRACE: 3,
  BRACKET: 4,
  BOLD_DOUBLE_LEFT: 5,
  BOLD_DOUBLE_RIGHT: 6,
  THIN_DOUBLE: 7,
  NONE: 8,
};

export class Formatter {
  constructor() {
    this.joinVoices = fn().mockReturnValue(this);
    this.formatToStave = fn().mockReturnValue(this);
  }
}
Formatter.FormatAndDraw = fn();
Formatter.SimpleFormat = fn();

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
  Voice,
  StaveConnector,
  Formatter,
  Beam,
  Barline,
};

export default mockVex;