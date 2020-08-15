
const LabelService = require("../labelservice");
const { LABEL_OPTIONS } = require("../consts");

describe("Label service tests", () => {

   test("should instantiate class", () => {
      const labelService = new LabelService([]);
      expect(labelService).toBeDefined();
   });

   test("should filter labels correctly", () => {
      const labels = [
         {name: "Potencial", id: "2132323"},
         {name: "Shortlist", id: "1111111"},
         {name: "Candidato da base", id: "2222222"},
      ];
      const labelService = new LabelService(labels);
      expect(labelService.labels.length).toBe(1);
   });


   test("label should not be available", () => {
      const labelService = new LabelService([]);
      const isLabelAvailable = labelService.isLabelAvailable("Candidato da base");
      expect(isLabelAvailable).toBeFalsy();
   });

   test("label should be available", () => {
      const labelService = new LabelService([]);
      const isLabelAvailable = labelService.isLabelAvailable(LABEL_OPTIONS.POTENCIAL);
      expect(isLabelAvailable).toBeTruthy();
   });


   test("should return false when passing wrong label to tag", () => {
      const labelService = new LabelService([]);
      const cardTaggedSuccessfully = labelService.tagCard(1212312, "wrong_label");
      expect(cardTaggedSuccessfully).toBeFalsy();
   });

   test("should return false when pipe doesnt have label registered", () => {
      const labelService = new LabelService([]);
      const cardTaggedSuccessfully = labelService.tagCard(1212312, LABEL_OPTIONS.ELIMINADO);
      expect(cardTaggedSuccessfully).toBeFalsy();
   });

   test("should tag when pipe have label registered", () => {
      const labelService = new LabelService([{name: LABEL_OPTIONS.ELIMINADO, id: 1231232}]);
      labelService.pipefyApi.tagCard = jest.fn();
      labelService.tagCard(20, LABEL_OPTIONS.ELIMINADO);
      expect(labelService.pipefyApi.tagCard).toHaveBeenCalledWith(20, 1231232);
   });

});
