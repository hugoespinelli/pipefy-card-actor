
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

};
