


const { EXPERIENCE_LEVELS } = require("../../../models/positionspecifications");
const Feedback = require("../../../models/feedback");
const ApplicantPaymentRange = require("../../../models/applicantpaymentrange");

const REASON = "Pretensão salarial";
const KEYWORD_TO_SEARCH = "salarial";

const regexToFindSalary = /(\d\.?)\d*,/gm;

// First position of array is min value accepted
// Second position of array is max value accepted
const JOB_ACCEPTED_SALARIES_RANGE = {
    0: [0, 3000],
    1500: [0, 6000],
    3000: [1500, 8000],
    6000: [3000, 999999],
    8000: [6000, 999999],
};

module.exports = class SalaryAnalyzer {

    constructor(positionSpecification) {
        this.payment = positionSpecification.payment;
    }

    analyze(card) {
        const field = card.fields.find(field => field.name.search(KEYWORD_TO_SEARCH) !== -1 );

        if(!field) {
            return new Feedback(false, REASON);
        }

        const paymentRange = this.extractValueFromString(field.value);
        console.log(paymentRange);
        return this.isOnRange(paymentRange.min) ? new Feedback(true) : new Feedback(false, REASON);
    }

    extractValueFromString(string) {
        let match, paymentRange = [];
        let applicantPaymentRange = new ApplicantPaymentRange();

        while(match = regexToFindSalary.exec(string)) {
            let fullGroupMatch = match[0];
            fullGroupMatch = this.transformToInt(fullGroupMatch);
            paymentRange.push(fullGroupMatch);
        }

        console.log(paymentRange);
        if(paymentRange.length === 1) {

            if(paymentRange[0] >= 5000) {
                applicantPaymentRange.min = paymentRange[0];
            } else {
                applicantPaymentRange.max = paymentRange[0];
            }

        } else {
            applicantPaymentRange.min = paymentRange[0];
            applicantPaymentRange.max = paymentRange[1];
        }

        return applicantPaymentRange
    }

    transformToInt(value) {
        return parseInt(value.replace(".", "").replace(",", ""));
    }

    isOnRange(minValue) {
        let range;
        try {
            range = JOB_ACCEPTED_SALARIES_RANGE[minValue];
        } catch(e) {
            console.log(`Pretensão salarial não registrada min -> R$ ${minValue}`);
            return false;
        }
        return this.payment >= range[0] && this.payment <= range[1];
    }

};
