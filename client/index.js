/* globals PipefyApp */
import React from "react";
import { render } from "react-dom";
import { uniqWith } from "lodash";
import { Button } from 'pipestyle'; 
import PipefyApi from "./api.js";

const pipefy = PipefyApp.init();

class ReactSample extends React.Component {
  constructor(props) {
    super(props);
    
    const pipefyApi = new PipefyApi();
    
    const response = fetch("https://tame-turquoise-marjoram.glitch.me/mover").then(r => console.log(r));
    
    console.log(response);

    this.state = { pipe: null, phases: [] };
  }
  componentDidMount() {
    
    pipefy.pipe().then(pipe => {
        this.setState({ pipe });
      });
    
    pipefy.fields().then(fields => {
      console.log(fields);
      let phases = fields.map(field => ({
        id: field.phase.id,
        name: field.phase.name
      }));
      phases = uniqWith(phases, (p1, p2) => {
        console.log(p1);
        console.log(p2);
        return p1.id === p2.id;
      });

      this.setState({ phases });
    });
  }
  
  moveCards() {
    console.log("Apertou botão")
  }

  render() {
    
    if (!this.state.pipe) {
      return <div />;
    }
    
    console.log(this.state.pipe);
    console.log(this.state.phases);
    const phases = this.state.phases;
    
    return (
      <div className="container-fluid">
        
        <div className="row">

          <h4>Quero mover da fase:</h4>
          <div className="pp-custom-select-sm">
            <select className="pp-select">
              {phases.map(phase => (
                <option value={phase.id}> {phase.name} </option>
              ))}
            </select>
          </div>
          
        </div>
        
        <br />
        <br />
        
        <div className="row">
        
          <h4>Para fase:</h4>
          <div className="pp-custom-select-sm">
            <select className="pp-select">
              {phases.map(phase => (
                <option value={phase.id}> {phase.name} </option>
              ))}
            </select>
          </div>
        
        </div>
        
        <br />
        <br />
        
        <Button theme="primary" onClick={() => this.moveCards()}>
          Mover!
        </Button>
        
      </div>
    );
  }
}

render(<ReactSample />, document.getElementById("application"));
