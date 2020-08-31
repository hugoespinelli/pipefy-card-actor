
const CardTagger = require("../cardsservice");


describe("Card tagger tests", () => {

    test("should instantiate class correctly", () => {
       const cardTagger = new CardTagger(2323);
       expect(cardTagger).toBeDefined();
    });

    test("should call get cards api", () => {
        const cardTagger = new CardTagger(2323);
        cardTagger.pipefyApi.get_all_cards = jest.fn();
        cardTagger.getCardsFromPipe();
        expect(cardTagger.pipefyApi.get_all_cards).toHaveBeenCalled();
    });

    test("should call get cards info from general pipe when get EliminatedCandidatecards", () => {
        const cardTagger = new CardTagger(2323);
        cardTagger.pipefyApi.getCard = jest
            .fn()
            .mockReturnValue({card: {fields: []}});

        const cards = [
            {
                child_relations: [
                    {
                        cards: [{id: 21321}]
                    }
                ]
            }];
        cardTagger.fillCardsInfoFromGeneralPipe(cards);
        expect(cardTagger.pipefyApi.getCard).toHaveBeenCalled();
    });

    test("should map api response correctly", async () => {
        const cardTagger = new CardTagger(301345144);
        await cardTagger.getCardsFromPipe();
        const cards = await cardTagger.fillCardsInfoFromGeneralPipe(cardTagger.cards);
        // console.log(cardTagger.EliminatedCandidatecards);
        console.log(cards);
    });

});
