
const Feedback = require("../../../models/feedback");
const { EXPERIENCE_LEVELS } = require("../../../models/positionspecifications");
const InternshipExperiencer = require("./experiencers/internshipexperiencer");
const RegularExperiencer = require("./experiencers/regularexperiencer");
const { KNOWHOW_LEVELS } = require("./experiencers/consts");

const REASON = "O candidato não possui proficiência das tecnologias necessárias para a vaga";
const KEYWORDS_TO_SEARCH = ["conhecimento", "experiência", "experiencia"];

const MINIMUM_REQUIREMENTS = {
    [EXPERIENCE_LEVELS.ESTAGIO]: new InternshipExperiencer(),
    [EXPERIENCE_LEVELS.JUNIOR]: new RegularExperiencer(KNOWHOW_LEVELS.LOW, KNOWHOW_LEVELS.NONE),
    [EXPERIENCE_LEVELS.PLENO]: new RegularExperiencer(KNOWHOW_LEVELS.MEDIUM, KNOWHOW_LEVELS.NONE),
    [EXPERIENCE_LEVELS.SENIOR]: new RegularExperiencer(KNOWHOW_LEVELS.HIGH, [KNOWHOW_LEVELS.LOW, KNOWHOW_LEVELS.NONE]),
};

class KnowledgeAnalyzer {

    constructor(positionSpecification) {
        this.experiencer = MINIMUM_REQUIREMENTS[positionSpecification.experienceLevel];
    }

    analyze(card) {
        const fields = card.fields.filter(field =>
            KEYWORDS_TO_SEARCH.some(keyword => field.name.toLowerCase().search(keyword) !== -1)
        );
        if(fields.length === 0) {
            return new Feedback(true);
        }

        const isApproved = this.experiencer.isApproved(fields);
        return isApproved ? new Feedback(true) : new Feedback(false, REASON);
    }

}

module.exports = KnowledgeAnalyzer;
