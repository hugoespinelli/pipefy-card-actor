
const CardTagger = require("../cardtagger");


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

    test("should call get cards info from general pipe when get cards", () => {
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

});
