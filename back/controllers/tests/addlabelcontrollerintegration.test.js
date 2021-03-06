
const AddLabelCardController = require("../addlabelcardcontroller");


describe("Add label controller integration tests", () => {

    test("should instantiate class correctly", () => {
        const addLabelCardController = new AddLabelCardController(301345144);
        expect(addLabelCardController ).toBeDefined();
    });

    test("should get labels info", async () => {
        const addLabelCardController = new AddLabelCardController(301345144);
        const labels = await addLabelCardController.getLabelsFromPipe();
        console.log(labels);
        expect(labels.length).toBeGreaterThan(1);
    });

    describe("function fill labels functions should integrate services correctly",  () => {

        jest.setTimeout(15000);

        test("service label should be populated", async () => {

            const addLabelCardController = new AddLabelCardController(301345144);
            const labelsMock = [
                { id: '304536662', name: 'Shortlist' },
                { id: '304536663', name: 'Potencial' },
                { id: '304536664', name: 'Candidato da Base' },
                { id: '304536665', name: 'Eliminado' },
                { id: '304536666', name: 'Comunicação1' },
                { id: '304536667', name: 'Comunicação2' },
                { id: '304536668', name: 'Avaliação' }
            ];
            addLabelCardController.getLabelsFromPipe = jest.fn().mockReturnValue(labelsMock);
            await addLabelCardController.build();
            await addLabelCardController.fillEliminatedCardsLabelsInPipe();
        });


        test("it should fill labels on EliminatedCandidatecards that passed in candidatos base phase" , async () => {

            const addLabelCardController = new AddLabelCardController(301345144);
            const labelsMock = [
                { id: '304536662', name: 'Shortlist' },
                { id: '304536663', name: 'Potencial' },
                { id: '304536664', name: 'Candidato da Base' },
                { id: '304536665', name: 'Eliminado' },
                { id: '304536666', name: 'Comunicação1' },
                { id: '304536667', name: 'Comunicação2' },
                { id: '304536668', name: 'Avaliação' }
            ];
            addLabelCardController.getLabelsFromPipe = jest.fn().mockReturnValue(labelsMock);
            await addLabelCardController.build();
            await addLabelCardController.fillCandidatoBaseLabelsInPipe();
        });

    });

    test("it should mount position specifiction correctly", async () => {

        const addLabelCardController = new AddLabelCardController(301345144);

        const positionSpecification = await addLabelCardController.getPositionSpecification();
        expect(positionSpecification).toBeDefined();
    });




});
