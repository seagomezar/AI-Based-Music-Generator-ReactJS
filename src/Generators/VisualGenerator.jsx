import React from 'react';
import { MIN_RADIUS, MAX_RADIUS } from '../Constants';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 320;

function getRandomX() {
  const min = MIN_RADIUS + 20;
  const max = CANVAS_WIDTH - MIN_RADIUS - 20;
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomY() {
  const min = MIN_RADIUS + 20;
  const max = CANVAS_HEIGHT - MIN_RADIUS - 20;
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor() {
  const palette = [
    '#a67c2e', // classical gold
    '#7a1f2d', // classical burgundy
    '#b45309', // amber bronze
    '#0f766e', // deep teal
    '#9a3412', // terracotta
    '#1e3a8a', // royal blue
    '#c2410c', // warm sienna
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

function getRandomRadius() {
  return Math.floor(Math.random() * (MAX_RADIUS - MIN_RADIUS)) + MIN_RADIUS;
}

export function generateCircle(note) {
  const r = getRandomRadius();
  const color = getRandomColor();
  return (
    <circle
      key={note}
      id={note}
      cx={getRandomX()}
      cy={getRandomY()}
      r={r}
      data-color={color}
    />
  );
}