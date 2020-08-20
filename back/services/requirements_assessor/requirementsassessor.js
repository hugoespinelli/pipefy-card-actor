
module.exports = class RequirementsAssessor {
    constructor(cards, analyzers, positionSpecification) {
        this.cards = cards;
        this.analyzers = analyzers.map(analyzer => new analyzer(positionSpecification));
    }

    analyzeCards() {
        this.cards = cards.map(card => {
            const feedbacks = this.analyzers.map(analyzer => analyzer.analyze(card));
            return {...card, feedbacks};
        });
    }

};
