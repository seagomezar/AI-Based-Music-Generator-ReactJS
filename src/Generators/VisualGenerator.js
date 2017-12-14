import React from 'react';
import {MIN_RADIUS, WIDTH, HEIGHT, MAX_RADIUS} from '../Constants';

function getRandomX() {
    const MAX = WIDTH - MIN_RADIUS;
    let x = Math.floor(MAX - Math.random() * MAX);
    if (x < MIN_RADIUS) {
        x += MIN_RADIUS;
    }
    return x;
}

function getRandomY() {
    const MAX = HEIGHT - MIN_RADIUS;
    let y = Math.floor(MAX - Math.random() * MAX);
    if (y < MIN_RADIUS) {
        y += MIN_RADIUS;
    }
    return y;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomRadius() {
    let radius = Math.floor(MAX_RADIUS - Math.random() * MAX_RADIUS) + MIN_RADIUS;
    return radius;
}

export function generateCircle(note) {
    const circle = <circle
        key={note}
        id={note}
        cx={getRandomX()}
        cy={getRandomY()}
        r={getRandomRadius()}
        data-color={getRandomColor()}>
    </circle>;
    return circle;
}