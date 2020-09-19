
const { EXPERIENCE_LEVELS } = require("../../../models/positionspecifications");
const Feedback = require("../../../models/feedback");

const REASON = "Nível profissional";
const KEYWORD_TO_SEARCH = "Nível profissional";

const JOB_FIT = {
    [EXPERIENCE_LEVELS.ESTAGIO]: [EXPERIENCE_LEVELS.ESTAGIO, EXPERIENCE_LEVELS.JUNIOR],
    [EXPERIENCE_LEVELS.JUNIOR]: [EXPERIENCE_LEVELS.ESTAGIO, EXPERIENCE_LEVELS.JUNIOR, EXPERIENCE_LEVELS.PLENO],
    [EXPERIENCE_LEVELS.PLENO]: [EXPERIENCE_LEVELS.JUNIOR, EXPERIENCE_LEVELS.PLENO, EXPERIENCE_LEVELS.SENIOR],
    [EXPERIENCE_LEVELS.SENIOR]: [EXPERIENCE_LEVELS.PLENO, EXPERIENCE_LEVELS.SENIOR],
};

module.exports = class ExperienceAnalyzer {

    constructor(positionSpecification) {
        this.experienceRequired = positionSpecification.experienceLevel;
    }

    analyze(card) {
        const field = card.fields.find(field => field.name.search(KEYWORD_TO_SEARCH) !== -1 );
        if(!field) {
            return new Feedback(false, REASON);
        }

        let personLevelExperience = field.value.toLowerCase();
        personLevelExperience = this.removeTrailingFromExperienceString(personLevelExperience);
        const isApproved = JOB_FIT[personLevelExperience].includes(this.experienceRequired);
        return isApproved ? new Feedback(true) : new Feedback(false, REASON);
    }

    removeTrailingFromExperienceString(string) {
        const stringSplitted = string.split(" ");
        const stringSize = stringSplitted.length;
        if(stringSize === 1) {
            return stringSplitted[0];
        }

        return stringSplitted[stringSize-1]

    }

};
