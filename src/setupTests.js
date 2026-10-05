// Jest/Vitest setup for polyfills

// Configure React act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill for structuredClone which is required by VexFlow 5.x
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}