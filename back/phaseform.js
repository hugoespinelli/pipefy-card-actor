const { convert_date } = require("./utils");

const DATE_TYPE = "date";
const SELECT_TYPE = "select";
const RADIO_TYPE = "radio_vertical";
const CHECKLIST_TYPE = "checklist_vertical";
const SHORT_TEXT_TYPE = "short_text";
const LONG_TEXT_TYPE = "long_text";

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
        return convert_date(new Date());

      default:
        return null;
    }
  }
};
