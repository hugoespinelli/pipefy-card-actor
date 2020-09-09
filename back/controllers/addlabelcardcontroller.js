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

const CANDIDATO_BASE_PHASE = "F1: Candidato da base";
const PHASES_TO_GET_CARDS_TO_ELIMNATED_LABEL = [CANDIDATO_BASE_PHASE, "F1: Cadastro completo"];
const TABLE_ID = "BhE5WSrq";

const EXPERIENCE_POSITION_FIELD = "nivel_profissional_da_vaga";
const SALARY_POSITION_FIELD = "salario";


module.exports = class AddLabelCardController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.cardTaggerService = new CardsService(pipeId);
        this.pipeService = new PipeService(pipeId);
        this.tableService = new TableService(TABLE_ID);
        this.pipe = null;
        this.cards = [];
    }

    async build() {
        await this.loadPipe();
        await this.loadCards();
    }

    async loadPipe() {
        const { pipe } = await this.pipeService.getInfo(this.pipeId);
        this.pipe = pipe;
    }

    async loadCards() {
        this.cards = await this.cardTaggerService.getCardsFromPipe();
    }

    getLabelsFromPipe() {
        return this.pipe.labels;
    }

    filterCardsByPhaseNames(cards, phasesNames) {
        return cards.filter(c => phasesNames.includes(c.current_phase.name))
    }

    async getPositionSpecification() {
        const table_records = await this.tableService.getTable();
        const pipeIdFound = table_records.find(row => parseInt(row.node.title) === this.pipeId);

        if (!pipeIdFound) {
            console.log(`O pipe ${this.pipeId} não está cadastrado!`);
            return null;
        }

        const experience = pipeIdFound.node.record_fields.find(field => field.name === EXPERIENCE_POSITION_FIELD);
        const salary = pipeIdFound.node.record_fields.find(field => field.name === SALARY_POSITION_FIELD);

        if (!experience || !salary) {
            console.log(`O salario e/ou a experiencia nao estao cadastrados no pipe ${this.pipeId}!`);
            return null;
        }

        return new PositionSpecifications(
            experience.value,
            false,
            parseInt(salary.value)
        );

    }

    filterCardsByPhaseHistoryName(cards, phaseName) {
        return cards.filter(card => {
           const phasesHistory =  card.phases_history;
           return phasesHistory.some(({phase}) => phase.name === phaseName);
        });
    }

    async fillCandidatoBaseLabelsInPipe() {
        const labels = this.getLabelsFromPipe();
        const labelService = new LabelService(labels);

        let cards = this.filterCardsByPhaseHistoryName(this.cards, CANDIDATO_BASE_PHASE);
        return Promise.all(cards.map(card => {
            const oldLabelsIds = card.labels.map(l => l.id);
            return labelService.tagCard(card.id, LABEL_OPTIONS.CANDIDATO_BASE, oldLabelsIds);
        }));
    }

    async fillEliminatedCardsLabelsInPipe() {
        const labels = this.getLabelsFromPipe();
        const labelService = new LabelService(labels);

        let cards = this.filterCardsByPhaseNames(this.cards, PHASES_TO_GET_CARDS_TO_ELIMNATED_LABEL);

        const positionSpecifications = await this.getPositionSpecification();

        if (!positionSpecifications) {
            return false;
        }

        const requirementsAssessor = new RequirementsAssessorService([
            SalaryAnalyzer, ExperienceAnalyzer, KnowledgeAnalyzer, LocationAnalyzer
        ], positionSpecifications);

        cards = requirementsAssessor.analyzeCards(cards);
        this.cards = cards;
        return Promise.all(cards.map(async card => {
            const isEliminated = card.feedbacks.some(feedback => feedback.isApproved === false);
            const labelsIds = card.labels.map(l => l.id);
            if (isEliminated) {
                return labelService.tagCard(card.id, LABEL_OPTIONS.ELIMINADO, labelsIds)
            } else {
                return labelService.tagCard(card.id, LABEL_OPTIONS.POTENCIAL, labelsIds);
            }
        }));
    }


};
