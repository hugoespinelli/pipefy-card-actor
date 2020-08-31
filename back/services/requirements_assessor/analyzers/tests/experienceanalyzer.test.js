
const ExperienceanalyzerTest = require("../experienceanalyzer");
const {PositionSpecifications, EXPERIENCE_LEVELS} = require("../../../../models/positionspecifications");

describe("Experience analyzer tests", () => {

    test("it should return false when persons doesnt fill form with experience", () => {
        const experienceAnalyzer = new ExperienceanalyzerTest(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
        const cardMock = {
            fields: [
                {
                    "name": "Modelo de contratação",
                    "value": "estagio"
                }
            ]
        };
        const feedback = experienceAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeFalsy();
    });

    test("it should return true when person is junior level with junior job level requirement", () => {
        const experienceAnalyzer = new ExperienceanalyzerTest(new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, null, null));
        const cardMock = {
            fields: [
                {
                    "name": "Nível profissional",
                    "value": "Júnior"
                }
            ]
        };
        const feedback = experienceAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeTruthy();
    });

    test("it should return true when person is junior level with pleno job level requirement", () => {
        const experienceAnalyzer = new ExperienceanalyzerTest(new PositionSpecifications(EXPERIENCE_LEVELS.PLENO, null, null));
        const cardMock = {
            fields: [
                {
                    "name": "Nível profissional",
                    "value": "Júnior"
                }
            ]
        };
        const feedback = experienceAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeTruthy();
    });

    test("it should return false when person is junior level with senior job level requirement", () => {
        const experienceAnalyzer = new ExperienceanalyzerTest(new PositionSpecifications(EXPERIENCE_LEVELS.SENIOR, null, null));
        const cardMock = {
            fields: [
                {
                    "name": "Nível profissional",
                    "value": "Júnior"
                }
            ]
        };
        const feedback = experienceAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeFalsy();
    });

});
