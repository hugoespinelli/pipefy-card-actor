const PipefyApi = require("../../api");

module.exports = class TableService {

    constructor(tableId) {
        this.tableId = tableId;
        this.pipefyApi = PipefyApi;
    }

    async getTable() {
        return await this.pipefyApi.getTable(this.tableId);
    }
};
