
const MoverController = require("../movercontroller");

describe("Mover controller integration tests", () => {

    test("it should move cards to phaseName", async () => {
        const PIPE_ID_TEST = 301413532;

        const moverController = new MoverController(PIPE_ID_TEST);
        const cardsIds = [384138764];
        moverController.cardService.moveCardsToPhaseId = jest.fn();
        await moverController.moveCardsToPhaseName(cardsIds, "F1: Completar cadastro");
        expect(moverController.cardService.moveCardsToPhaseId).toHaveBeenCalledWith(cardsIds, "309413152");

    });

});
