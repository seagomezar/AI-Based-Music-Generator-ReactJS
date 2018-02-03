import React, { Component } from 'react';
import './Panel.css';
import { MAJOR_SCALES } from '../Constants';
class Panel extends Component {

    constructor() {
        super();
        this.state = {
            isTopBarShowed: false,
            duration: 0,
            speed: 0,
            scale: "C"
        };
        this.hideTopBar = this.hideTopBar.bind(this);
        this.showTopBar = this.showTopBar.bind(this);
        this.bindToState = this.bindToState.bind(this);
    }

    hideTopBar() {
        const panel = document.getElementById("panel");
        panel.classList.remove("showBar");
        panel.classList.add("hideBar");
        this.setState({
            isTopBarShowed: false
        });
    }

    showTopBar() {
        const panel = document.getElementById("panel");
        panel.classList.remove("hideBar");
        panel.classList.add("showBar");
        this.setState({
            isTopBarShowed: true
        });
    }

    componentDidMount() {
        this.setState({
            duration: this.props.duration,
            speed: this.props.tempo
        })
    }

    bindToState(event) {
        if(event.target.name === 'duration') {
            this.setState({duration: Number(event.target.value)});
        } else if(event.target.name === 'speed') {
            this.setState({speed: Number(event.target.value)});
        } else if(event.target.name === 'scale') {
            this.setState({scale: event.target.value});
        } else if(event.target.name === 'visualizationType') {
            this.setState({visualizationType: event.target.value});
        }
    }

    render() {
        return (<aside className="panel hideBar" id="panel" >
            <section>
                <h2>What are you listening?</h2>
                <p>
                    A computer created song, Do you like it?
                </p>
                <h2>What is this?</h2>
                <p>
                    Well, It is a interesting question. I will try to describe the better for you..<br />
                    Basically, I am trying to create music using a set of patterns
                    to create differend kind of musical genders and author based composition.
                </p>
                <h2>Can you manipulate what you're listening?</h2>
                <p>
                    Of course, you can! there is the set of controls I can give you!. enjoy!
                    I will add more soon...
                </p>
                <div className="form">
                    <div>
                        <label>Speed (BPM): </label>
                        <input type="number" size="3" value={this.state.speed} name="speed" onChange={this.bindToState} />
                    </div>
                    <div>
                        <label># of Measures: </label>
                        <input type="number" size="3" value={this.state.duration} name="duration" onChange={this.bindToState} />
                    </div>
                    <div>
                    <label>Scale base: </label>
                        <select name="scale" value={this.state.scale} onChange={this.bindToState}>
                            {
                                Object.keys(MAJOR_SCALES).map((e) => {
                                    return <option value={e} key={e}>{e} Major</option>;
                                })

                            }
                        </select>
                    </div>
                    <div className="button">
                        <button onClick={()=>{
                            this.props.handleRun(this.state.speed, this.state.duration, this.state.scale)}}>Run this</button>
                    </div>
                </div>
                <h2>Can you change the visualization?</h2>
                <p >
                    Yes you can!, for now I only this visualizations for you:
                    </p>
                    <div className="form">
                        <div>
                            <label>Visualization: </label>
                            <select name="visualizationType" value={this.state.visualizationType} onChange={this.bindToState}>
                                <option value="circles">Circles (Default)</option>
                                <option value="piano">Piano</option>
                            </select>
                        </div>
                        <div className="button">
                        <button onClick={()=>{
                            this.props.handleChangeVisualization(this.state.visualizationType)}}>Run Visualization</button>
                        </div>
                    </div>
                
                <h2>How did I build this?</h2>
                <p>
                    Ok for the implementation I'm using Javascript and react.js with <a href="https://tonejs.github.io/" >Tone.js</a> for the sounds and the timeline to play music,
                    <a href="https://musical-artifacts.com/artifacts/3" > Salamander Piano</a> to build and play the right piano sounds , and <a href="http://www.vexflow.com/" >Vexflow</a> to pain the score you see below.
                    Here is the <a href="https://github.com/seagomezar/AI-Based-Music-Generator-ReactJS" >link to the source code</a>.
                </p>
                <h2>What next for this project?</h2>
                <p>
                    Actually I want to include different kind of artificial inteligence structures like Marcov Models, Neural networks,
                    Deep Machine Learning? Shoot me with your ideas with a PR!
                </p>
            </section>
            <nav>
                {
                    (this.state.isTopBarShowed) ?
                        <button onClick={this.hideTopBar}>Hide</button> :
                        <button onClick={this.showTopBar}>More Info</button>
                }
            </nav>
        </aside>);
    }
}

export default Panel;