/* globals PipefyApp */
import React from "react";
import { render } from "react-dom";
import { uniqWith } from "lodash";

const pipefy = PipefyApp.init();

class ReactSample extends React.Component {
  constructor(props) {
    super(props);

    this.state = { pipe: null, phases: [] };
  }
  componentDidMount() {
    PipefyApp.render(() => {
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
    });
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
        <h2>Movedor de cards</h2>
        <div className="row">
          
          <div className="col-md-6">
            <h4>Quero mover da fase:</h4>
            <div className="pp-custom-select-sm">
              <select className="pp-select" style={{width: "20%"}}>
                {phases.map(phase => (
                  <option value={phase.id}> {phase.name} </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="col-md-6">
            <h4>Para fase:</h4>
            <div className="pp-custom-select-sm">
              <select className="pp-select" style={{width: "20%"}}>
                {phases.map(phase => (
                  <option value={phase.id}> {phase.name} </option>
                ))}
              </select>
            </div>
          </div>
          
        </div>
        
      </div>
    );
  }
}

render(<ReactSample />, document.getElementById("application"));
