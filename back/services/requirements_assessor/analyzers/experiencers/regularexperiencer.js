const { KNOWHOW_POINTS } = require("./consts");

module.exports = class RegularExperiencer {

    constructor(minimumRequirement, nonRequirements) {
      this.minimumRequirement = minimumRequirement;
      if (!Array.isArray(nonRequirements)) {
          this.nonRequirements = [nonRequirements]
      } else {
          this.nonRequirements = nonRequirements;
      }
    }

    isApproved(fields) {
        return this.isApprovedOnMinimumRequirements(fields) && this.isApprovedOnNonRequirements(fields);
    }

    isApprovedOnMinimumRequirements(fields) {
        return fields.some(field => KNOWHOW_POINTS[field.value.toLowerCase()] >= KNOWHOW_POINTS[this.minimumRequirement]);
    }

    isApprovedOnNonRequirements(fields) {
        return fields.every(field => !this.nonRequirements.includes(field.value.toLowerCase()));
    }


};
