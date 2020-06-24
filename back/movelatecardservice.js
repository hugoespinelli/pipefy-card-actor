module.exports = class MoveLateCardsService {

    constructor(phases) {
        this.phases = phases;
        this.phaseToBeSearched = "F1: Completar cadastro";
        this.phaseToBeMovedIfCardsAreLate = "F1: Completar cadastro2 (*)";
    }

    findPhase(phaseName) {
        return this.phases.find(phase => phase.name === phaseName);
    }
    filterLateCards(cards) {
        return cards.filter(card => card.late);
    }



};
