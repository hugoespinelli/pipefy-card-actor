
const FeedbackController = require("../feedbackcontroller");
const Feedback = require("../../models/feedback");


describe("Feedback controller integration tests", () => {

    test("it should filter card that will receive feedback", () => {
        const cards = [
            { feedbacks: [new Feedback(false), new Feedback(true), new Feedback(true)]},
            { feedbacks: [new Feedback(true), new Feedback(true), new Feedback(true)]},
            { feedbacks: [new Feedback(false), new Feedback(false), new Feedback(false)]},
        ];

        const pipe = {phases: []};
        const feedbacker = new FeedbackController(cards, pipe);
        expect(feedbacker.EliminatedCandidatecards.length).toBe(2);
    });

    test("it should get phase field form", () => {
        const pipeInfo = {
            "phases": [
                {
                    "name": "F6: Eliminado",
                    "id": "309413169",
                    "fields": [
                        {
                            "id": "por_que_n_o_foi_selecionado",
                            "internal_id": "320526220",
                            "uuid": "fb1ca5b4-2a6e-4573-9271-a72ea29deb48",
                            "description": "",
                            "label": "Motivo",
                            "options": [
                                "Avaliação técnica",
                                "Avaliação comportamental",
                                "Experiência profissional",
                                "Fit com a empresa",
                                "Modelo de trabalho",
                                "Nível de conhecimento das tecnolgias",
                                "Nível profissional ",
                                "Pretensão salarial",
                                " "
                            ],
                            "required": false,
                            "type": "select",
                            "is_multiple": false
                        }
                    ]
                },
                {
                    "name": "F6: [Feedback] Eliminado",
                    "id": "309413170",
                    "fields": []
                },
                {
                    "name": "FX: Reativação",
                    "id": "309413171",
                    "fields": []
                }
            ],
        };

        const feedbacker = new FeedbackController([], pipeInfo);
        expect(feedbacker.feedbackField).toBeDefined();
        expect(feedbacker.feedbackOptionsAvailable.length).toBe(9);
    });

    // test("it should update eliminated field form", async () => {
    //     const pipeInfo = {
    //         "phases": [
    //             {
    //                 "name": "F6: Eliminado",
    //                 "id": "309413169",
    //                 "fields": [
    //                     {
    //                         "id": "por_que_n_o_foi_selecionado",
    //                         "internal_id": "320526220",
    //                         "uuid": "fb1ca5b4-2a6e-4573-9271-a72ea29deb48",
    //                         "description": "",
    //                         "label": "Motivo",
    //                         "options": [
    //                             "Avaliação técnica",
    //                             "Avaliação comportamental",
    //                             "Experiência profissional",
    //                             "Fit com a empresa",
    //                             "Modelo de trabalho",
    //                             "Nível de conhecimento das tecnolgias",
    //                             "Nível profissional ",
    //                             "Pretensão salarial",
    //                             " "
    //                         ],
    //                         "required": false,
    //                         "type": "select",
    //                         "is_multiple": false
    //                     }
    //                 ]
    //             }
    //         ],
    //     };
    //
    //     const EliminatedCandidatecards = [
    //         {
    //             id: 382769406,
    //             feedbacks: [
    //                 new Feedback(false, "Modelo de trabalho"), new Feedback(true), new Feedback(true)
    //             ]
    //         }
    //     ];
    //
    //     const feedbacker = new FeedbackController(EliminatedCandidatecards, pipeInfo);
    //     try {
    //         await feedbacker.updateCardFeedback();
    //     } catch (e) {
    //         console.log(e);
    //     }
    //
    //
    // });

    test("it should filter candidates potential cards", () => {
        const cards = [
            { feedbacks: [new Feedback(false), new Feedback(true), new Feedback(true)]},
            { feedbacks: [new Feedback(true), new Feedback(true), new Feedback(true)]},
            { feedbacks: [new Feedback(false), new Feedback(false), new Feedback(false)]},
        ];
        const pipeInfo = {
            "phases": [
                {
                    "name": "F6: Eliminado",
                    "id": "309413169",
                    "fields": [
                        {
                            "id": "por_que_n_o_foi_selecionado",
                            "internal_id": "320526220",
                            "uuid": "fb1ca5b4-2a6e-4573-9271-a72ea29deb48",
                            "description": "",
                            "label": "Motivo",
                            "options": [
                                "Avaliação técnica",
                                "Avaliação comportamental",
                                "Experiência profissional",
                                "Fit com a empresa",
                                "Modelo de trabalho",
                                "Nível de conhecimento das tecnolgias",
                                "Nível profissional ",
                                "Pretensão salarial",
                                " "
                            ],
                            "required": false,
                            "type": "select",
                            "is_multiple": false
                        }
                    ]
                },
                {
                    "name": "F6: [Feedback] Eliminado",
                    "id": "309413170",
                    "fields": []
                },
                {
                    "name": "FX: Reativação",
                    "id": "309413171",
                    "fields": []
                }
            ],
        };
        const feedbacker = new FeedbackController(cards, pipeInfo);
        expect(feedbacker.potentialCandidateCards.length).toBe(1);
    });

});
