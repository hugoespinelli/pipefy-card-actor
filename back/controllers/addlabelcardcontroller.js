const CardsService = require("../services/cards/cardsservice");
const PipeService = require("../services/piper/pipeservice");
const LabelService = require("../services/label/labelservice");
const TableService = require("../services/tabler/tableservice");
const { LABEL_OPTIONS } = require("../services/label/consts");
const RequirementsAssessorService = require("../services/requirements_assessor/requirementsassessorservice");

const SalaryAnalyzer = require("../services/requirements_assessor/analyzers/salaryanalyzer");
const ExperienceAnalyzer = require("../services/requirements_assessor/analyzers/experienceanalyzer");
const KnowledgeAnalyzer = require("../services/requirements_assessor/analyzers/knowledgeanalyzer");
const LocationAnalyzer = require("../services/requirements_assessor/analyzers/locationanalyzer");

const {PositionSpecifications, EXPERIENCE_LEVELS} = require("../models/positionspecifications");

const PHASE_TO_GET_CARDS_TO_LABEL = "F1: Inscrito na vaga";
const TABLE_ID = "zY3IsJ6P";

const EXPERIENCE_POSITION_FIELD = "nivel_profissional_da_vaga";
const SALARY_POSITION_FIELD = "salario";


module.exports = class AddLabelCardController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.cardTaggerService = new CardsService(pipeId);
        this.pipeService = new PipeService(pipeId);
        this.tableService = new TableService(TABLE_ID);
        this.pipe = null;
    }

    async loadPipe() {
        const { pipe } = await this.pipeService.getInfo(this.pipeId);
        this.pipe = pipe;
    }

    getLabelsFromPipe() {
        return this.pipe.labels;
    }

    getPhase() {
        return this.pipe.phases.find(phase => phase.name === PHASE_TO_GET_CARDS_TO_LABEL);
    }

    async getPositionSpecification() {
        const table_records = await this.tableService.getTable();
        const pipeIdFound = table_records.find(row => row.node.title == this.pipeId);

        if (!pipeIdFound) {
            console.log(`O pipe ${this.pipeId} não está cadastrado!`);
            return null;
        }

        const experience = pipeIdFound.node.record_fields.find(field => field.name === EXPERIENCE_POSITION_FIELD);
        const salary = pipeIdFound.node.record_fields.find(field => field.name === SALARY_POSITION_FIELD);

        return new PositionSpecifications(
            experience.value,
            false,
            parseInt(salary.value)
        );

    }

    async fillCardsLabelsInPipe() {
        await this.loadPipe();
        const labels = this.getLabelsFromPipe();
        const labelService = new LabelService(labels);

        const phaseToFilter = this.getPhase();
        let cards = await this.cardTaggerService.getCardsFromPipe([phaseToFilter.id]);

        const positionSpecifications = await this.getPositionSpecification();

        if (!positionSpecifications) {
            return false;
        }

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
