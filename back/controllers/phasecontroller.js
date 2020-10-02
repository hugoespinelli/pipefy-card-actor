
const {addDays, convert_date} = require("../utils");
const FormService = require("../cardservice");
const PipeService = require("../services/piper/pipeservice");
const PipefyApi = require("../api");
const PhaseForm = require("../phaseform");

module.exports = class PhaseController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.pipefyapi = new PipefyApi();
        this.pipeService = new PipeService(pipeId);
    }

    async updateCardsFormValue(cards, phaseName, value=null) {

        const phase = await this.pipeService.getPhaseInfoByName(phaseName);

        const phasesForms = phase.fields.map(
            ({ id, options, type, required, is_multiple }) =>
                new PhaseForm(id, options, type, required, is_multiple)
        );

        const formService = new FormService(phasesForms, cards, this.pipefyapi);

        return formService.updateCardsFields(value);
    }

    async updateCardsDueDate(cards, phaseName) {

        const phase = await this.pipeService.getPhaseInfoByName(phaseName);

        const phasesForms = phase.fields.map(
            ({ id, options, type, required, is_multiple }) =>
                new PhaseForm(id, options, type, required, is_multiple)
        );
        const phaseFormToGenerateDueDate = phasesForms.find(phase => phase.type === "date");
        let dueDate = phaseFormToGenerateDueDate.generate_answer();
        dueDate = addDays(dueDate, 1);
        return this.pipefyapi.updateCardsDueDate(cards.map(c => c.id), convert_date(dueDate));
    }

};
