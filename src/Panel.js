import React, { Component } from 'react';

class Panel extends Component {
    
        constructor() {
            super();
            this.state = {
                isTopBarShowed: false
            };
            this.hideTopBar = this.hideTopBar.bind(this);
            this.showTopBar = this.showTopBar.bind(this);
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

        render() {
            return (<aside className="panel hideBar" id="panel" >
            <section>
                <h2>What am I listening?</h2>
                <p>
                    A computer created song based on bethoven compositions, do you like it?
                </p>
                <h2>What is this?</h2>
                <p>
                    Well, It is a interesting questions, I will try to describe the better for you..<br />
                    Basically, I am trying to create music using artificial inteligence and a set of patters
                    to create differend kind of musical genders and author based composition.
                </p>
                <h2>Can I manipulate what I'm listening?</h2>
                <p>
                    Of course my friend there is the set of controls I can give you!. enjoy!
                </p>
                <form>
                    <div>
                        <label>Speed: </label>
                        <input type="number" size="3" />
                    </div>
                    <div>
                        <label># of Measures: </label>
                        <input type="number" size="3" />
                    </div>
                    <div>	<label>Gender like: </label>
                        <select>
                            <option>Jazz</option>
                            <option>Rock</option>
                            <option>Clasical </option>
                        </select>
                    </div>
                    <div>
                        <label>Author like: </label>
                        <select>
                            <option>Bethoven</option>
                            <option>Mozart</option>
                        </select>
                    </div>
                    <div>
                        <label>Scale base: </label>
                        <select>
                            <option>C Major</option>
                            <option>D Major</option>
                            <option>G Major</option>
                        </select>
                    </div>
                    <div>
                        <button>Run this</button>
                    </div>
                </form>
                <h2>How you built this?</h2>
                <p>
                    Ok for the implementation I'm using Javascript and react.js with <a href="">Tone.js</a> for the sounds and the timeline to play music,
                    <a href="">Salamander Piano</a> to build and play the right piano sounds , and <a href="">Vexflow</a> to pain the score you see below.
                    For the hard part which is artificial inteligence I'm using synaptic.js which allow me to create and train a simple neural network which
                    is able to create the composition for you. Here is the <a href="">link to the source code</a>
                </p>
                <h2>Wait... Why react?</h2>
                <p>Oh man, no problem, here is the link to the <a href="">angular project</a>, <a href="">vue project</a>, and <a href="">vanilla js project</a>.</p>
                <h2>What next for this project?</h2>
                <p>
                    Actually I don't have idea, What do you like? more author based compositions?,
                    more genders?, different kind of artificial inteligence structures like Marcov Models?,
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