const CardsService = require("../services/cards/cardsservice");
const PipeService = require("../services/piper/pipeservice");
const LabelService = require("../services/label/labelservice");
const { LABEL_OPTIONS } = require("../services/label/consts");
const RequirementsAssessorService = require("../services/requirements_assessor/requirementsassessorservice");

const SalaryAnalyzer = require("../services/requirements_assessor/analyzers/salaryanalyzer");
const ExperienceAnalyzer = require("../services/requirements_assessor/analyzers/experienceanalyzer");
const KnowledgeAnalyzer = require("../services/requirements_assessor/analyzers/knowledgeanalyzer");
const LocationAnalyzer = require("../services/requirements_assessor/analyzers/locationanalyzer");

const {PositionSpecifications, EXPERIENCE_LEVELS} = require("../models/positionspecifications");

module.exports = class AddLabelCardController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.cardTaggerService = new CardsService(pipeId);
        this.pipeService = new PipeService(pipeId);
    }

    async getLabelsFromPipe() {
        const pipeInfo = await this.pipeService.getInfo(this.pipeId);
        return pipeInfo.pipe.labels;
    }

    async fillCardsLabelsInPipe() {
        const labels = this.getLabelsFromPipe();
        const labelService = new LabelService(labels);

        let cards = await this.cardTaggerService.getCardsFromPipe();

        const positionSpecifications = new PositionSpecifications(EXPERIENCE_LEVELS.JUNIOR, true, 3000);
        const requirementsAssessor = new RequirementsAssessorService([
            SalaryAnalyzer, ExperienceAnalyzer, KnowledgeAnalyzer, LocationAnalyzer
        ], positionSpecifications);

        cards = requirementsAssessor.analyzeCards(cards);
        return Promise.all(cards.map(async card => {
            const isEliminated = card.feedbacks.some(feedback => feedback.isApproved === false);
            if (isEliminated) {
                await labelService.tagCard(card.id, LABEL_OPTIONS.ELIMINADO)
            } else {
                await labelService.tagCard(card.id, LABEL_OPTIONS.POTENCIAL);
            }
        }));
    }


};
