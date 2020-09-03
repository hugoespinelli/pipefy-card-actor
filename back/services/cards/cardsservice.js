const PipefyApi = require("../../api");

module.exports = class CardsService {
    constructor(pipeId) {
        this.pipefyApi = new PipefyApi();
        this.pipeId = pipeId;
    }

    async getCardsFromPipe(phaseIds) {
        try {
            const cards = await this.pipefyApi.get_all_cards(this.pipeId, phaseIds);
            return await this.fillCardsInfoFromGeneralPipe(cards);
        } catch (e) {
            throw new Error(e);
        }

    }

    fillCardsInfoFromGeneralPipe(cards) {
        return Promise.all(cards.map(async node => {
            const card = node.node;
            const child_relations = card.child_relations;

            if(child_relations.length === 0) {
                console.log(`Card ${card.title} não conectado com nenhum card`);
                return card;
            }

            const pipeRelation = child_relations.filter(card => card.cards.length > 0);

            if(pipeRelation.length === 0) {
                console.log(`Card ${card.title} não conectado com nenhum card`);
                return card;
            }

            const cardId = pipeRelation[0].cards[0].id;
            const response = await this.pipefyApi.getCard(cardId);
            const generalPipeCardInfo = response.data.data;
            return { ...card, fields: card.fields.concat(generalPipeCardInfo.card.fields) };

        }));

    }

    async getCardsFromPhase(phaseName) {
        const cards = await this.pipefyApi.get_all_cards(this.pipeId);
        return cards.filter(c => c.node.current_phase.name === phaseName);
    }

    moveLateCards(cards, toPhaseId) {
        const lateCards = this.filterLateCards(cards);
        const cardsIds = lateCards.map(c => c.id);
        return this.pipefyApi.moveCardsToPhase(cardsIds, toPhaseId);
    }

    filterLateCards(cards) {
        return cards.filter(c => c.late);
    }

};
