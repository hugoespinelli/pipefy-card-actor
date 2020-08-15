const PipefyApi = require("../../api");

module.exports = class CardTagger {
    constructor(pipeId) {
        this.pipefyApi = new PipefyApi();
        this.pipeId = pipeId;
        this.cards = [];
    }

    getCardsFromPipe() {
        this.cards = this.pipefyApi.get_all_cards(this.pipeId);
    }

    async fillCardsInfoFromGeneralPipe(cards) {
        return await cards.map(async card => {
            const child_relations = card.child_relations;

            if(child_relations.length === 0) {
                console.log(`Card ${card.title} não conectado com nenhum card`);
                return {...card, specifications: []};
            }

            const cardId = child_relations[0].cards[0].id;
            const generalPipeCardInfo = this.pipefyApi.getCard(cardId);
            return { ...card, specifications: generalPipeCardInfo.card.fields};

        }) ;

    }

};
