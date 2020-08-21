const PipefyApi = require("../../api");

module.exports = class PipeService {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.pipefyApi = new PipefyApi();
    }

    async getInfo() {
        const response = await this.pipefyApi.get_pipe_info(this.pipeId);
        return response.data.data;
    }
};
