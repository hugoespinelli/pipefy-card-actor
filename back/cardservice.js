module.exports = class CardsService {
  constructor(phasesForms, cards, pipefyapi) {
    this.phasesForms = phasesForms.filter(phaseform => phaseform.required);
    this.pipefyapi = pipefyapi;
    this.cards = cards;
  }

  updateCardsFields(fieldAnswer = null) {
    let promises = [];

    for (let card of this.cards) {
      
      const fieldsToUpdate = this.phasesForms.filter(
        phase => !card.fields.some(field => field.field.id === phase.id)
      );

      fieldsToUpdate.map(phaseForm =>
        promises.push(this.pipefyapi.updateCardsFields(
          [card.id],
          phaseForm.id,
          fieldAnswer == null ? phaseForm.generate_answer() : fieldAnswer
        ))
      );
    }

    return Promise.all(promises);
  }
};
