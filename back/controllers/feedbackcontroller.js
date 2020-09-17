
const FeedbackService = require("../services/feedback/feedbackservice");
const CardsService = require("../services/cards/cardsservice");

const FEEDBACK_PHASE = "F6: Eliminado";
const POTENTIAL_PHASE = "F4: Potencial";

module.exports = class FeedbackController {

    constructor(cards, pipeInfo) {
        this.EliminatedCandidatecards = this.filterCardsThatWillReceiveFeedback(cards);
        this.potentialCandidateCards = this.filterPotentialCards(cards);
        this.pipeInfo = pipeInfo;
        this.feedbackField = this.getFeedbackField();
        this.feedbackQuestionId = this.feedbackField.id;
        this.feedbackOptionsAvailable = this.getFeedbackOptionsAvailable(this.feedbackField);
        this.feedbackService = new FeedbackService();
        this.cardsService = new CardsService();
    }

    getFeedbackOptionsAvailable(phase) {
        return phase.options;
    }

    getFeedbackField() {
        const phase = this.getPhase(FEEDBACK_PHASE);
        return phase.fields[0];
    }

    filterCardsThatWillReceiveFeedback(cards) {
        return cards.filter(card => card.feedbacks.some(feedback => !feedback.isApproved));
    }

    filterPotentialCards(cards) {
        return cards.filter(card => card.feedbacks.every(feedback => feedback.isApproved))
    }

    isFeedbackMapped(feedback) {
        return this.feedbackOptionsAvailable.some(f => f === feedback);
    }

    updateCardFeedback() {
        return Promise.all(this.EliminatedCandidatecards.map(card => {
            const negativeFeedbacks = card.feedbacks.filter(feedback => !feedback.isApproved);
            const feedbackToSend = negativeFeedbacks.find(nf => this.isFeedbackMapped(nf.reason));

            if (!feedbackToSend) {
                console.log(`O card ${card.id} não possui nenhum feedback mapeado!`);
                return;
            }

            console.log(`O card id ${card.id} foi reprovado por ${feedbackToSend.reason.toLowerCase()}`);
            return this.feedbackService.sendFeedback(card.id, this.feedbackQuestionId, feedbackToSend.reason);
        }));
    }

    getPhase(phaseName) {
        const phase = this.pipeInfo.phases.find(phase => phase.name === phaseName);
        if (!phase) {
            throw Error(`Não existe a fase de ${phaseName} nesse pipe`);
        }
        return phase;
    }


    moveCardsToEliminatedPhase() {
        const phase = this.getPhase(FEEDBACK_PHASE);
        this.cardsService.moveLateCards(this.EliminatedCandidatecards, phase.id);
    }

    moveCardsToPotentialPhase() {
        const phase = this.getPhase(POTENTIAL_PHASE);
        this.cardsService.moveLateCards(this.potentialCandidateCards, phase.id);
    }


};
