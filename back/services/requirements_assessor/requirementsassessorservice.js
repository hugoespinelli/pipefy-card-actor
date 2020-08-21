
module.exports = class RequirementsAssessorService {
    constructor(analyzers, positionSpecification) {
        this.analyzers = analyzers.map(analyzer => new analyzer(positionSpecification));
    }

    analyzeCards(cards) {
        return cards.map(card => {
            const feedbacks = this.analyzers.map(analyzer => analyzer.analyze(card));
            return {...card, feedbacks};
        });
    }

};
