// Mock for Tone.js to prevent Jest issues with ES modules
export const Sampler = jest.fn().mockImplementation(() => ({
  toMaster: jest.fn().mockReturnThis(),
}));

export const Transport = {
  cancel: jest.fn(),
  clear: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  bpm: {
    rampTo: jest.fn(),
  },
};

export const Part = jest.fn();
export const Draw = {
  schedule: jest.fn(),
};

const Tone = {
  Sampler,
  Transport,
  Part,
  Draw,
};

export default Tone;