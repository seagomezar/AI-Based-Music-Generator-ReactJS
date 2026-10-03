// Mock for Tone.js to prevent issues in testing environments
const fn = typeof vi !== 'undefined' ? vi.fn : jest.fn;

export class Sampler {
  constructor() {
    this.toDestination = fn().mockReturnValue(this);
    this.toMaster = fn().mockReturnValue(this);
    this.triggerAttackRelease = fn();
  }
}

export const Transport = {
  cancel: fn(),
  clear: fn(),
  start: fn(),
  stop: fn(),
  bpm: {
    rampTo: fn(),
  },
};

export class Part {
  constructor() {
    this.start = fn().mockReturnValue(this);
  }
}

export const Draw = {
  schedule: fn(),
};

export const Time = fn().mockImplementation(() => ({
  toSeconds: fn().mockReturnValue(0.5),
}));

export const start = fn().mockResolvedValue();

const Tone = {
  Sampler,
  Transport,
  Part,
  Draw,
  Time,
  start,
};

export default Tone;