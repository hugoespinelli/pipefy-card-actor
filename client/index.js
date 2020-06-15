/* globals PipefyApp */
import React from "react";
import { render } from "react-dom";
import { uniqWith } from "lodash";
import { Button } from "pipestyle";
import PipefyApi from "./api.js";
import { UPDATE_FIELDS_ROUTE, MOVE_CARDS_ROUTE } from "./routes.js";

const pipefy = PipefyApp.init();

class CardMoverPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pipe: null,
      phases: [],
      fromPhase: null,
      toPhase: null,
      shouldFillAnswers: false
    };
  }
  componentDidMount() {
    pipefy.pipe().then(pipe => {
      this.setState({ pipe });
    });

    pipefy.fields().then(fields => {
      let phases = fields.map(field => ({
        id: field.phase.id,
        name: field.phase.name
      }));

      phases = uniqWith(phases, (p1, p2) => p1.id === p2.id);

      this.setState({ phases });
    });
  }

  moveCards() {
    const { fromPhase, toPhase, shouldFillAnswers, pipe } = this.state;

    if (fromPhase === null || toPhase === null) {
      pipefy.showNotification("As fases devem ser selecionadas", "error");
    }

    const pipeId = pipe.internalId;
    const pipefyApi = new PipefyApi().get_instance();

    if (shouldFillAnswers) {
      this.fillFormCards(pipeId, fromPhase).then(() =>
        this.moveCardsRequest(pipeId, fromPhase, toPhase)
      );
    } else {
      this.moveCardsRequest(pipeId, fromPhase, toPhase);
    }
  }

  fillFormCards(pipeId, phaseId) {
    const pipefyApi = new PipefyApi().get_instance();
    return pipefyApi
      .post(
        UPDATE_FIELDS_ROUTE.replace(":pipeId", pipeId).replace(
          ":phaseId",
          phaseId
        )
      )
      .then(() => pipefy.showNotification("O form dos cards foi atualizado com sucesso!", "success"))
      .catch(err => pipefy.showNotification(err, "error"));
  }

  moveCardsRequest(pipeId, fromPhase, toPhase) {
    const pipefyApi = new PipefyApi().get_instance();
    return pipefyApi
      .post(MOVE_CARDS_ROUTE.replace(":pipeId", pipeId), {
        fromPhase,
        toPhase
      })
      .then(() => pipefy.showNotification("Os cards foram movidos com sucesso!", "success"))
      .catch(err => pipefy.showNotification(err, "error"));
  }

  render() {
    if (!this.state.pipe) {
      return <div />;
    }

    console.log(this.state.pipe);
    console.log(this.state.phases);
    const { phases, shouldFillAnswers } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <h4>Quero mover da fase:</h4>
          <div className="pp-custom-select-sm">
            <select
              className="pp-select"
              onChange={e => this.setState({ fromPhase: e.target.value })}
            >
              <option value={null} selected disabled hidden>
                Escolha a fase
              </option>
              {phases.map(phase => (
                <option value={phase.id}> {phase.name} </option>
              ))}
            </select>
          </div>
        </div>

        <br />

        <div className="pp-checkbox">
          <input
            id="answer_checkbox"
            type="checkbox"
            checked={shouldFillAnswers}
            onChange={e =>
              this.setState({ shouldFillAnswers: e.target.checked })
            }
          />
          <label for="answer_checkbox" tabindex="0">
            Preencher automaticamente as respostas
          </label>
        </div>

        <br />

        <div className="row">
          <h4>Para fase:</h4>
          <div className="pp-custom-select-sm">
            <select
              className="pp-select"
              onChange={e => this.setState({ toPhase: e.target.value })}
            >
              <option value={null} selected disabled hidden>
                Escolha a fase
              </option>
              {phases.map(phase => (
                <option value={phase.id}> {phase.name} </option>
              ))}
              s
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

render(<CardMoverPage />, document.getElementById("application"));
