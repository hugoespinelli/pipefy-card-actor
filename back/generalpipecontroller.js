const Pipefyapi = require("./api");

const ENROLL_PHASE = "F1: Inscrito na vaga";
const COMPLETE_REGISTER_PHASE = "F1: Completar cadastro";
const REGISTERED_PHASE = "F1: Candidato da base";

const FIELD_LINK_CARD_NAME = "cadastro2";

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
        const cardsInEnrollPhase = await this.pipefyapi.get_all_cards(pipeId, phase.id);
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

        console.log("antes sort", cardsFound);
        cardsFound = cardsFound.sort((c1, c2) => {
            if (c1.createdAt < c2.createdAt) return 1;
            if (c1.createdAt > c2.createdAt) return -1;
            return 0;
        });

        console.log("antes sort", cardsFound);

        return cardsFound[0];

    }

    async connectGeneralPipeAndMove(enrollCard) {
        const cardEmail = enrollCard.title;
        const cardInGeneralPipeWithThisEmail = this.searchCardEmailInGeneralPipe(cardEmail);
        if (cardInGeneralPipeWithThisEmail === null) {
            const completeRegisterPhase = this.getPhase(COMPLETE_REGISTER_PHASE);
            return this.pipefyapi.moveCardToPhase(enrollCard.id, completeRegisterPhase.id);
        }
        const registeredPhase = this.getPhase(REGISTERED_PHASE);
        console.log('card picked:', cardInGeneralPipeWithThisEmail);
        await this.pipefyapi.updateCardField(enrollCard.id, FIELD_LINK_CARD_NAME, cardInGeneralPipeWithThisEmail.id);
        return this.pipefyapi.moveCardToPhase(enrollCard.id, registeredPhase.id);
    }

};