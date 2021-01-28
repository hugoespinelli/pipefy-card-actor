
const CardsService = require("../services/cards/cardsservice");
const PipeService = require("../services/piper/pipeservice");
const FeedbackService = require("../services/feedback/feedbackservice");

module.exports = class MoverController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.cardService = new CardsService(pipeId);
        this.pipeService = new PipeService(pipeId);
        this.feedbackService = new FeedbackService();
    }

    async moveLateCardsFromTo(fromPhaseName, toPhaseName) {

        await this.pipeService.loadPipe();
        const toPhase = await this.pipeService.getPhaseInfoByName(toPhaseName);

        if (!toPhase) {
            console.log(`Nao existe a fase ${toPhaseName} do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        let cardsToBeMoved = await this.cardService.getCardsFromPhase(fromPhaseName);
        return this.cardService.moveLateCards(cardsToBeMoved.map(c => c.node), toPhase.id);
    }

    async moveCardsToPhaseName(cardsIds, toPhaseName) {

        await this.pipeService.loadPipe();
        const toPhase = await this.pipeService.getPhaseInfoByName(toPhaseName);

        if (!toPhase) {
            console.log(`Nao existe a fase ${toPhaseName} do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        return this.cardService.moveCardsToPhaseId(cardsIds, toPhase.id);
    }

    async moveCardsToPhaseNameAndFillFeedback(fromPhaseName, toPhaseName, feedbackReason) {

        await this.pipeService.loadPipe();
        const toPhase = await this.pipeService.getPhaseInfoByName(toPhaseName);

        if (!toPhase) {
            console.log(`Nao existe a fase ${toPhaseName} do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        if (toPhase.fields.length === 0) {
            console.log(`Nao existe a pergunta do feedback do pipe ${this.pipeId}`);
            return Promise.resolve();
        }

        const feedbackField = toPhase.fields[0];

        let cardsToBeMoved = await this.cardService.getCardsFromPhase(fromPhaseName);
        cardsToBeMoved = cardsToBeMoved.map(c => c.node);
        let lateCardsToBeMoved = this.cardService.filterLateCards(cardsToBeMoved);
        const feedbackPromises = lateCardsToBeMoved.map(c => this.feedbackService.sendFeedback(c.id, feedbackField.id, feedbackReason));
        return Promise.all([
            this.cardService.moveLateCards(cardsToBeMoved, toPhase.id),
            ...feedbackPromises
        ]);
    }

};
