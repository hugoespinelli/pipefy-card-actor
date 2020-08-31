
const SalaryAnalyzer = require("../salaryanalyzer");
const {PositionSpecifications} = require("../../../../models/positionspecifications");

describe("Salary analyzer tests", () => {

    describe("Extraction tests", () => {

        test("should extract value from field correctly when have range", () => {
            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications());

            const cardMock = {
                field: {
                    "name": "Pretensão salarial",
                    "value": "a) de R\\$ 500,00 Até R\\$ 1.500,00"
                }
            };

            const paymentRange = salaryAnalyzer.extractValueFromString(cardMock.field.value);
            expect(paymentRange.max).toBe(1500);
            expect(paymentRange.min).toBe(500);
        });

        test("should extract value from field correctly", () => {
            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications());

            const cardMock = {
                field: {
                    "name": "Pretensão salarial",
                    "value": "a) Até R\\$ 1.500,00"
                }
            };

            const paymentRange = salaryAnalyzer.extractValueFromString(cardMock.field.value);
            expect(paymentRange.max).toBe(1500);
            expect(paymentRange.min).toBe(0);
        });

        test("should extract value from field correctly", () => {
            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications());

            const cardMock = {
                field: {
                    "name": "Pretensão salarial",
                    "value": "e) Acima de 8.000,00"
                }
            };

            const paymentRange = salaryAnalyzer.extractValueFromString(cardMock.field.value);
            expect(paymentRange.max).toBeGreaterThan(50000);
            expect(paymentRange.min).toBe(8000);
        });

    });

    describe("Range value tests", () => {

        test("it should allow senior payment to this job salary", () => {

            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications(null,  null, 7000));
            const isApproved = salaryAnalyzer.isOnRange(8000);
            expect(isApproved).toBeTruthy();
        });

        test("it shouldnt allow senior payment to this job salary", () => {

            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications(null,  null, 5000));
            const isApproved = salaryAnalyzer.isOnRange(8000);
            expect(isApproved).toBeFalsy();
        });

        test("it shouldnt allow junior payment to this job salary", () => {

            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications(null,  null, 9000));
            const isApproved = salaryAnalyzer.isOnRange(3000);
            expect(isApproved).toBeFalsy();
        });

    });

    describe("Integration analyze tests", () => {

        test("it should true for senior job application when salary is compatible", () => {

            const salaryAnalyzer = new SalaryAnalyzer(new PositionSpecifications(null,  null, 9000));
            const cardMock = {
                fields: [ {
                    "name": "Pretensão salarial",
                    "value": "e) Acima de 8.000,00"
                }]
            };

            const feedback = salaryAnalyzer.analyze(cardMock);
            expect(feedback.isApproved).toBeTruthy
        });

    });

});
