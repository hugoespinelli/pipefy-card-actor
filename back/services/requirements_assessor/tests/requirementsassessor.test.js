
const RequirementAssessor = require("../requirementsassessorservice");
const LocationAnalyzer = require("../analyzers/locationanalyzer");
const {PositionSpecifications} = require("../../../models/positionspecifications");

describe("Requirements assessor tests", () => {

    test("should instantiate class", () => {
        const positionSpecifications = new PositionSpecifications(null, null, null, null);
        const requirementAssessor = new RequirementAssessor([], [], positionSpecifications);
        expect(requirementAssessor).toBeDefined();
    });

    test("should instantiate analyzers when instantiate class", () => {
        const positionSpecifications = new PositionSpecifications(null, null, null, null);
        const requirementAssessor = new RequirementAssessor([], [LocationAnalyzer], positionSpecifications);
        expect(requirementAssessor.analyzers[0]).toBeDefined();
    });

});
