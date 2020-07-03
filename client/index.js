/* globals PipefyApp */
import React from "react";
import { render } from "react-dom";
import { Button } from "pipestyle";
import PipefyApi from "./api.js";
import { UPDATE_FIELDS_ROUTE, MOVE_CARDS_ROUTE, PHASES_ROUTE } from "./routes.js";

const pipefy = PipefyApp.init();

class CardMoverPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pipe: null,
      phases: [],
      cardsCanBeMoveToPhases: [],
      fromPhase: null,
      toPhase: null,
      shouldFillAnswers: false
    };
  }
  componentDidMount() {
    pipefy.pipe().then(pipe => {
      this.setState({ pipe, phases: pipe.phases });
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
          toPhase,
          shouldUpdateDueDate: true
        })
        .then(() => pipefy.showNotification("Os cards foram movidos com sucesso!", "success"))
        .catch(err => pipefy.showNotification(err, "error"));
  }

  pickFromPhase(phaseId) {

    const pipefyApi = new PipefyApi().get_instance();
    pipefyApi
        .get(PHASES_ROUTE.replace(":phaseId", phaseId))
        .then(({data}) => {
          this.setState({ fromPhase: phaseId, cardsCanBeMoveToPhases: data.phase.cards_can_be_moved_to_phases })
        })
        .catch(err => pipefy.showNotification(err, "error"));
  }

  render() {
    if (!this.state.pipe) {
      return <div />;
    }

    const { phases, shouldFillAnswers, cardsCanBeMoveToPhases } = this.state;

    return (
        <div className="container-fluid">
          <div className="row">
            <h4>Quero mover da fase:</h4>
            <div className="pp-custom-select-sm">
              <select
                  className="pp-select"
                  onChange={e => this.pickFromPhase(e.target.value)}
              >
                <option value={null} selected disabled hidden>
                  Escolha a fase
                </option>
                {phases.map(phase => (
                    <option value={phase.id} key={phase.id}> {phase.name} </option>
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
                {cardsCanBeMoveToPhases.map(phase => (
                    <option value={phase.id} key={phase.id}> {phase.name} </option>
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
