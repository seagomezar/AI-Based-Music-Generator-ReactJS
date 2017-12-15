import React, { Component } from 'react';
import { generateAllNotes } from '../Generators/MusicGenerator';
import { generateCircle } from '../Generators/VisualGenerator';
import { HEIGHT, WIDTH } from '../Constants';
import Piano from '../Piano/Piano';
import './Visualizator.css';

class Visualizator extends Component {

    constructor() {
        super();
        // Some initializations
		this.height = HEIGHT;
        this.width = WIDTH;
        this.state = {
            circles: []
        }
        this.addCircles = this.addCircles.bind(this);
    }
    
    addCircles(notesToAdd) {
		const circles = [];
		for (var i = 0; i < notesToAdd.length; i++) {
			const circle = generateCircle(notesToAdd[i]);
			circles.push(circle);
		}
		this.setState({ circles });
	}
    componentDidMount() {
        const allNotes = generateAllNotes();
        this.addCircles(allNotes);
    }
    render() {
        return (<div>
            { (this.props.type == 'circles') ? <svg height={this.height + 'px'}  
            width={this.width + 'px'}  
            className="svg">{this.state.circles}</svg>: <Piano />}
            
            </div>);
            
    }
}

export default Visualizator;