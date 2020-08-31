const PipefyApi = require("../../api");

module.exports = class TableService {

    constructor(tableId) {
        this.tableId = tableId;
        this.pipefyApi = new PipefyApi();
    }

    async getTable() {
        return await this.pipefyApi.getTable(this.tableId);
    }
};
