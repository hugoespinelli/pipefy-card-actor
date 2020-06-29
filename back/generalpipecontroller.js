const Pipefyapi = require("./api");

const ENROLL_PHASE = "F1: Inscrito na vaga";
const COMPLETE_REGISTER_PHASE = "F1: Completar cadastro";
const REGISTERED_PHASE = "F1: Candidato da base";

module.exports = class GeneralPipeController {

    constructor(cards, phases) {
        this.pipefyapi = new Pipefyapi();
        this.cards = cards;
        this.pipePhases = phases;
    }

    getPhase(phaseName) {
        return this.pipePhases.find(phase => phase.name === phaseName);
    }

    async getCardsFromEnrollPhase(pipeId){
        const phase = await this.getPhase(ENROLL_PHASE);
        const cardsInEnrollPhase = await pipefyapi.get_all_cards(pipeId, phase.id);
        return cardsInEnrollPhase.map(c => c.node);
    }

    searchCardEmailInGeneralPipe(email) {
        const cardsFound = this.cards.filter(c => c.title === email);

        if (cardsFound.length === 0) {
            return null;
        }

        if (cardsFound.length === 1) {
            return cardsFound[0];
        }

        cardsFound.sort((c1, c2) => {
            if (c1.createdAt > c2.createdAt) return 1;
            if (c1.createdAt < c2.createdAt) return -1;
            return 0;
        });

        return cardsFound[0];

    }

    async connectGeneralPipeAndMove(enrollCard) {
        const cardEmail = enrollCard.title;
        const cardsInGeneralPipeWithThisEmail = this.searchCardEmailInGeneralPipe(cardEmail);
        if (cardsInGeneralPipeWithThisEmail === null) {
            const completeRegisterPhase = this.getPhase(COMPLETE_REGISTER_PHASE);
            return this.pipefyapi.moveCardToPhase(enrollCard.id, completeRegisterPhase.id);
        }
        const registeredPhase = this.getPhase(REGISTERED_PHASE);
        // todo add connect card here
        return this.pipefyapi.moveCardToPhase(enrollCard.id, registeredPhase.id);
    }

};