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
    '#4cd7f6', // electric cyan
    '#ddb7ff', // neon purple
    '#ffb95f', // warm amber
    '#f43f5e', // coral red
    '#38bdf8', // sky blue
    '#a855f7', // violet
    '#34d399', // emerald
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