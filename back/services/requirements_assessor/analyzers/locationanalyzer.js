
const Feedback = require("../../../models/feedback");

const REASON = "Modelo de trabalho";
const KEYWORD_TO_SEARCH = "disponibilidade";
const POSITIVE_ANSWER = "sim";
const NEGATIVE_ANSWER = "não";

module.exports = class LocationAnalyzer {

    constructor(positionSpecification) {
        this.positionSpecification = positionSpecification;
    }

    analyze(card) {
        const field = card.fields.find(field => field.name.search(KEYWORD_TO_SEARCH) !== -1 );
        if(!field) {
            return new Feedback(true);
        }

        if(field.value.toLowerCase() === POSITIVE_ANSWER) {
            return new Feedback(true);
        }
        return new Feedback(false, REASON);
    }

};
