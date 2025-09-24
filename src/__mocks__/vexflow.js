// Mock for VexFlow to prevent DOM issues in Jest
const mockVex = {
  Flow: {
    Renderer: jest.fn().mockImplementation(() => ({
      resize: jest.fn(),
      getContext: jest.fn().mockReturnValue({
        setFont: jest.fn(),
        setFillStyle: jest.fn(),
        setStrokeStyle: jest.fn(),
        scale: jest.fn(),
        clear: jest.fn(),
      }),
    })),
    Stave: jest.fn().mockImplementation(() => ({
      setContext: jest.fn().mockReturnThis(),
      draw: jest.fn().mockReturnThis(),
      addClef: jest.fn().mockReturnThis(),
      addTimeSignature: jest.fn().mockReturnThis(),
      setNoteStartX: jest.fn().mockReturnThis(),
      getNoteStartX: jest.fn().mockReturnValue(0),
      setEndBarType: jest.fn().mockReturnThis(),
    })),
    StaveNote: jest.fn().mockImplementation(() => ({
      setContext: jest.fn().mockReturnThis(),
      setStave: jest.fn().mockReturnThis(),
      draw: jest.fn().mockReturnThis(),
      addAccidental: jest.fn().mockReturnThis(),
      addDotToAll: jest.fn().mockReturnThis(),
      getBoundingBox: jest.fn().mockReturnValue({
        x: 0, y: 0, w: 40, h: 40
      }),
    })),
    Voice: jest.fn().mockImplementation(() => ({
      setMode: jest.fn().mockReturnThis(),
      addTickables: jest.fn().mockReturnThis(),
      draw: jest.fn().mockReturnThis(),
      preFormat: jest.fn().mockReturnThis(),
    })),
    Formatter: {
      FormatAndDraw: jest.fn(),
      SimpleFormat: jest.fn(),
    },
    Accidental: jest.fn(),
    Beam: jest.fn().mockImplementation(() => ({
      setContext: jest.fn().mockReturnThis(),
      draw: jest.fn().mockReturnThis(),
    })),
    Dot: jest.fn(),
  }
};

export default mockVex;