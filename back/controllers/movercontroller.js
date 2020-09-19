
const CardsService = require("../services/cards/cardsservice");
const PipeService = require("../services/piper/pipeservice");

module.exports = class MoverController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.cardService = new CardsService(pipeId);
        this.pipeService = new PipeService(pipeId);
    }

    async moveLateCardsFromTo(fromPhaseName, toPhaseName) {

        await this.pipeService.loadPipe();
        const toPhase = await this.pipeService.getPhaseInfoByName(toPhaseName);

        if (!toPhase) {
            console.log(`Nao existe a fase ${toPhase} do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        let cardsToBeMoved = await this.cardService.getCardsFromPhase(fromPhaseName);
        return this.cardService.moveLateCards(cardsToBeMoved.map(c => c.node), toPhase.id);
    }

    async moveCardsToPhaseName(cardsIds, toPhaseName) {

        await this.pipeService.loadPipe();
        const toPhase = await this.pipeService.getPhaseInfoByName(toPhaseName);

        if (!toPhase) {
            console.log(`Nao existe a fase ${toPhase} do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        return this.cardService.moveCardsToPhaseId(cardsIds, toPhase.id);
    }

};
