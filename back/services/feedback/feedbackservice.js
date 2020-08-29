
const PipefyApi = require("../../api");


module.exports = class FeedbackService {

    constructor() {
        this.api = new PipefyApi();
    }

    sendFeedback(cardId, feedbackQuestionId, feedback) {
        return this.api.updateCardField(cardId, feedbackQuestionId, feedback)
    }

};
