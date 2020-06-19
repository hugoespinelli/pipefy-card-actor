const { convert_date, addDays, correctUTCtoBrazilZone} = require("./utils");

const DATE_TYPE = "date";
const SELECT_TYPE = "select";
const RADIO_TYPE = "radio_vertical";
const CHECKLIST_TYPE = "checklist_vertical";
const SHORT_TEXT_TYPE = "short_text";
const LONG_TEXT_TYPE = "long_text";

const LIMIT_DAYS_FOR_COMPLETE_REGISTER = 3;

module.exports = class PhaseForm {
  constructor(id, options, type, required, isMultiple) {
    this.id = id;
    this.options = options;
    this.type = type;
    this.required = required;
    this.isMultiple = isMultiple;
  }

  generate_answer() {
    switch (this.type) {
      case DATE_TYPE:
        let now = new Date();
        now = correctUTCtoBrazilZone(now);
        const dateLimit = addDays(now, LIMIT_DAYS_FOR_COMPLETE_REGISTER);
        return convert_date(dateLimit);

      default:
        return null;
    }
  }
};
