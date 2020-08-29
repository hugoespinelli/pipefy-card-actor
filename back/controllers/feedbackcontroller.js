
const FeedbackService = require("../services/feedback/feedbackservice");

const FEEDBACK_PHASE = "F6: Eliminado";

module.exports = class FeedbackController {

    constructor(cards, pipeInfo) {
        this.cards = this.filterCardsThatWillReceiveFeedback(cards);
        this.feedbackField = this.getFeedbackField(pipeInfo);
        this.feedbackQuestionId = this.feedbackField.id;
        this.feedbackOptionsAvailable = this.getFeedbackOptionsAvailable(this.feedbackField);
        this.feedbackService = new FeedbackService();
    }

    getFeedbackOptionsAvailable(phase) {
        return phase.options;
    }

    getFeedbackField(pipeInfo) {
        const phase = pipeInfo.phases.find(phase => phase.name === FEEDBACK_PHASE);
        if (!phase || phase.fields.length === 0) {
            throw Error("Não existe a fase de feedback nesse pipe");
        }
        return phase.fields[0];
    }

    filterCardsThatWillReceiveFeedback(cards) {
        return cards.filter(card => card.feedbacks.some(feedback => !feedback.isApproved));
    }

    isFeedbackMapped(feedback) {
        return this.feedbackOptionsAvailable.some(f => f === feedback);
    }

    updateCardFeedback() {
        return Promise.all(this.cards.map(card => {
            const negativeFeedbacks = card.feedbacks.filter(feedback => !feedback.isApproved);
            const feedbackToSend = negativeFeedbacks.find(nf => this.isFeedbackMapped(nf.reason));

            if (!feedbackToSend) {
                console.log(`O card ${card.id} não possui nenhum feedback mapeado!`);
                return;
            }

            return this.feedbackService.sendFeedback(card.id, this.feedbackQuestionId, feedbackToSend.reason);
        }));
    }


};
