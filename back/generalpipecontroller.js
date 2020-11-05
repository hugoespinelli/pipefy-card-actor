const Pipefyapi = require("./api");

const ENROLL_PHASE = "F1: Inscrito na vaga";
const COMPLETE_REGISTER_PHASE_1 = "F1: Completar cadastro";
const COMPLETE_REGISTER_PHASE_2 = "F1: Completar cadastro2 (*)";
const COMPLETE_REGISTER_PHASE_3 = "F1: Completar cadastro3";
const COMPLETED_REGISTER_PHASE = "F1: Cadastro completo";
const APPLICANT_FROM_BASE_PHASE = "F1: Candidato da base";
const COMPLETED_PROCESS_PHASE = "Processo completo";

const FIELD_LINK_CARD_NAME = "informa_es_de_cadastro";
// const FIELD_LINK_CARD_NAME = "informa_es_de_cadastro_2";

module.exports = class GeneralPipeController {

    constructor(cards, phases) {
        this.pipefyapi = Pipefyapi;
        this.cards = cards;
        this.pipePhases = phases;
    }

    getPhase(phaseName) {
        return this.pipePhases.find(phase => phase.name === phaseName);
    }

    getPhases(phasesName) {
        return this.pipePhases.filter(phase => phasesName.includes(phase.name));
    }

    async getCardsFromEnrollPhases(pipeId){
        const enrollPhases = await this.getPhases([
            ENROLL_PHASE,
            COMPLETE_REGISTER_PHASE_1,
            COMPLETE_REGISTER_PHASE_2,
            COMPLETE_REGISTER_PHASE_3
        ]);

        const cardsInEnrollPhase = await this.pipefyapi.get_all_cards(pipeId, enrollPhases.map(p => p.id));
        return cardsInEnrollPhase.map(c => c.node);
    }

    searchCardEmailInGeneralPipe(email) {
        let cardsFound = this.cards.filter(c => c.title === email);

        if (cardsFound.length === 0) {
            return null;
        }

        if (cardsFound.length === 1) {
            return cardsFound[0];
        }

        cardsFound = cardsFound.sort((c1, c2) => {
            if (c1.createdAt < c2.createdAt) return 1;
            if (c1.createdAt > c2.createdAt) return -1;
            return 0;
        });

        return cardsFound[0];

    }

    async connectGeneralPipe(enrollCard) {
        const cardEmail = enrollCard.title;
        const cardInGeneralPipeWithThisEmail = this.searchCardEmailInGeneralPipe(cardEmail);
        if (cardInGeneralPipeWithThisEmail === null) {
            const completeRegisterPhase = this.getPhase(COMPLETE_REGISTER_PHASE_1);
            return this.pipefyapi.moveCardToPhase(enrollCard.id, completeRegisterPhase.id);
        }

        return this.pipefyapi.updateCardField(enrollCard.id, FIELD_LINK_CARD_NAME, cardInGeneralPipeWithThisEmail.id);
    }

    moveCardToCompletedProcess(card) {
        const phaseToMove = this.getPhaseToMove(card.current_phase.name);
        return this.pipefyapi.moveCardToPhase(card.id, phaseToMove.id);
    }


    getPhaseToMove(cardFromGeneralPipePhaseName) {
        if (cardFromGeneralPipePhaseName !== COMPLETED_PROCESS_PHASE) {
            return this.getPhase(COMPLETED_REGISTER_PHASE);
        }
        return this.getPhase(APPLICANT_FROM_BASE_PHASE);
    }

};
