const { KNOWHOW_LEVELS } = require("./consts");

module.exports = class InternshipExperiencer {

    isApproved(fields) {
        return fields.some(field => field.value.toLowerCase() === KNOWHOW_LEVELS.LOW)
    }

};
