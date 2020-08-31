const { KNOWHOW_LEVELS, KNOWHOW_POINTS } = require("./consts");

module.exports = class InternshipExperiencer {

    isApproved(fields) {
        return fields.some(field => KNOWHOW_POINTS[field.value.toLowerCase()] >= KNOWHOW_POINTS[KNOWHOW_LEVELS.LOW])
    }

};
