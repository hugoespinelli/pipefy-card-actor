
const KnowledgeAnalyzer = require("../knowledgeanalyzer");
const {PositionSpecifications, EXPERIENCE_LEVELS} = require("../../../../models/positionspecifications");

describe("Knowledge analyzer tests", () => {

    test("it should return true when job doesnt have requirements", () => {
        const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
        const cardMock = {
            fields: [ {
                "name": "Data limite",
                "value": "07/08/2020"
            }]
        };
        const feedback = knowledgeAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeTruthy();
    });

    describe("test for internship", () => {

        test("it should return true when candidate have minimum requirements", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.ESTAGIO, null, null));
            const cardMock = {
                fields: [ {
                    "name": "conhecimento",
                    "value": "baixo"
                }]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy();
        });

    });

    describe("tests for junior", () => {

        test("it should return true when candidate have minimum requirements", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "baixo"
                    },
                    {
                        "name": "conhecimento",
                        "value": "medio"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy();
        });

        test("it should return false when candidate have a none knowledge in some technology", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "baixo"
                    },
                    {
                        "name": "conhecimento",
                        "value": "nenhum"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeFalsy();
        });

        test("it should return true when candidate is senior", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento yyy",
                        "value": "alto"
                    },
                    {
                        "name": "conhecimento xxx",
                        "value": "alto"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy();
        });

    });

    describe("tests for pleno", () => {

        test("it should return true when candidate have minimum requirements", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.PLENO, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "baixo"
                    },
                    {
                        "name": "conhecimento",
                        "value": "médio"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy();
        });

        test("it should return false when candidate have a none knowledge in some technology", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.PLENO, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "médio"
                    },
                    {
                        "name": "conhecimento",
                        "value": "nenhum"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeFalsy();
        });

    });

    describe("tests for senior", () => {

        test("it should return true when candidate have minimum requirements", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.SENIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "alto"
                    },
                    {
                        "name": "conhecimento",
                        "value": "medio"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy();
        });

        test("it should return false when candidate have a none knowledge in some technology", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.SENIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "alto"
                    },
                    {
                        "name": "conhecimento",
                        "value": "médio"
                    },
                    {
                        "name": "conhecimento",
                        "value": "nenhum"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeFalsy();
        });

        test("it should return false when candidate have a low knowledge in some technology", () => {
            const knowledgeAnalyzer = new KnowledgeAnalyzer(new PositionSpecifications(EXPERIENCE_LEVELS.SENIOR, null, null));
            const cardMock = {
                fields: [
                    {
                        "name": "conhecimento",
                        "value": "alto"
                    },
                    {
                        "name": "conhecimento",
                        "value": "baixo"
                    }
                ]
            };
            const feedback = knowledgeAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeFalsy();
        });

    });

});
