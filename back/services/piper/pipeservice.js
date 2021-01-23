const PipefyApi = require("../../api");

module.exports = class PipeService {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.pipefyApi = PipefyApi;
        this.pipe = null;
    }

    async loadPipe() {
        if (this.pipe === null) {
            this.pipe = await this.getInfo();
        }
    }

    async getInfo() {
        const response = await this.pipefyApi.get_pipe_info(this.pipeId);
        return response.data.data;
    }

    async getPhaseInfoByName(phaseName) {
        const pipe = this.pipe === null ? await this.getInfo() : this.pipe;
        return pipe.pipe.phases.find(phase => phase.name === phaseName);
    }
};
