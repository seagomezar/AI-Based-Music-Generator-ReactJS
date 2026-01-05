import React, { Component } from 'react';
import {ALL_FULL_NOTES} from '../Constants';
import './Piano.css';

class Piano extends Component {

    componentDidMount() {
        const totalWidth = window.innerWidth;
        const height = 120;

        const sizePerNote = totalWidth / (ALL_FULL_NOTES.length - 25);

        const piano = document.getElementById('piano');

        for (let i = 0; i < ALL_FULL_NOTES.length; i++) {
            var currentNote = ALL_FULL_NOTES[i];
            var node = document.createElement("li");
            node.className = 'white';
            node.style.height = height + "px";
            node.style.width = sizePerNote + "px";
            if (~currentNote.indexOf("#")) {
                node.className = 'black';
                node.style.width = sizePerNote / 1.6 + "px";
                node.style.height = height / 1.6 + "px";
            }
            node.setAttribute('id', currentNote);
            piano.appendChild(node);
        }
    }


    render() {
        return <div className="piano">
            <ul id="piano">
            </ul>
        </div>;
    }
}

export default Piano;