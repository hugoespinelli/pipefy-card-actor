
const LocationAnalyzer = require("../locationanalyzer");
const {PositionSpecifications} = require("../../../../models/positionspecifications");

describe("Location analyzer tests", () => {

    test("should return true when form doesnt have this type of question", () => {
        const locationAnalyzer = new LocationAnalyzer(new PositionSpecifications());
        const cardMock = {
          fields: [ {
              "name": "Data limite",
              "value": "07/08/2020"
          }]
        };
        const feedback = locationAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeTruthy();
    });


    test("should return true when candidate have availability to work on location", () => {
        const locationAnalyzer = new LocationAnalyzer(new PositionSpecifications());
        const cardMock = {
            fields: [{
                "name": "Você tem disponibilidade para trabalhar presencialmente no município do Rio de Janeiro - RJ?",
                "value": "Sim"
            }]
        };
        const feedback = locationAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeTruthy();
    });

    test("should return false when candidate doesnt have availability to work on location", () => {
        const locationAnalyzer = new LocationAnalyzer(new PositionSpecifications());
        const cardMock = {
            fields: [{
                "name": "Você tem disponibilidade para trabalhar presencialmente no município do Rio de Janeiro - RJ?",
                "value": "Não"
            }]
        };
        const feedback = locationAnalyzer.analyze(cardMock);
        expect(feedback.isApproved).toBeFalsy();
    });

});
