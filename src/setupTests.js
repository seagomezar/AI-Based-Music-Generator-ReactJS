// Jest setup for polyfills

// Polyfill for structuredClone which is required by VexFlow 5.x
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}