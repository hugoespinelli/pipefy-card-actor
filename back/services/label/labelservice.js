const { LABEL_OPTIONS } = require("./consts");
const PipefyApi = require("../../api");

module.exports = class LabelService {
    constructor(labels) {
        this.labels_options = Object.values(LABEL_OPTIONS);
        this.labels = this.searchLabels(labels);
        this.pipefyApi = new PipefyApi();
    }

    searchLabels(labels) {
        return labels.filter(label => this.labels_options.includes(label.name));
    }

    async tagCard(cardId, label) {
        if (!this.isLabelAvailable(label)) return false;
        if (!this.pipeHasLabelRegistered(label)) return false;

        const labelFromPipe = this.labels.find(l => l.name.toLowerCase() === label.toLowerCase());

        try {
            await this.pipefyApi.tagCard(cardId, labelFromPipe.id);
        } catch(e) {
            console.log(e);
            return false
        }
        return true;
    }

    isLabelAvailable(label) {
        return this.labels_options.includes(label);
    }

    pipeHasLabelRegistered(label) {
        const labelsRegistered = this.labels.map(label => label.name);
        return labelsRegistered.includes(label);
    }

};
