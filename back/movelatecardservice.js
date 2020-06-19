module.exports = class MoveLateCardsService {

    constructor() {
        this.phaseToBeSearched = "F1: Completar cadastro";
        this.phaseToBeMovedIfCardsAreLate = "F1: Completar cadastro2 (*)";
    }

    findPhase(phases, phaseName) {
        return phases.find(phase => phase.name === phaseName);
    }

    findPhaseToCheckLateCards(phases) {
        return this.findPhase(phases, this.phaseToBeSearched)
    }

    findPhaseToSendEmail(phases) {
        return this.findPhase(phases, this.phaseToBeMovedIfCardsAreLate)
    }

    filterLateCards(cards) {
        return cards.filter(card => card.late);
    }



};
