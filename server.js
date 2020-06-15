const express = require("express");

const compression = require("compression");
const cors = require("cors");
const app = express();
const Pipefyapi = require("./back/api.js");
const PhaseForm = require("./back/phaseform.js");
const CardsService = require("./back/cardservice.js");

//Enable body parser
app.use(express.json());

// Enable Compression
app.use(compression());

// Enable CORS
app.use(cors({ origin: "*" }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.get("/manifest.json", (request, response) => {
  response.sendFile(`${__dirname}/views/manifest.json`);
});

app.get("/view.html", (request, response) => {
  response.sendFile(`${__dirname}/views/pipe-view.html`);
});

app.get("/pipes/:pipeId/cards", async (request, response) => {
  const pipeId = request.params.pipeId;
  const { phase } = request.query;
  const pipefyapi = new Pipefyapi();

  try {
    const allCards = await pipefyapi.get_all_cards(pipeId, phase);
    response.json(allCards);
  } catch (e) {
    response.json(e);
  }
});

app.get("/pipes/public/registered_candidates", async (request, response) => {
  const PUBLIC_PIPE_ID = 1175536;
  const REGISTERED_CANDIDATES_PHASE_ID = 7862849;
  const pipefyapi = new Pipefyapi();

  try {
    const allCards = await pipefyapi.get_all_cards(
      PUBLIC_PIPE_ID,
      REGISTERED_CANDIDATES_PHASE_ID
    );
    response.json(allCards);
  } catch (e) {
    response.json(e);
  }
});

app.post("/pipes/:pipeId/move_cards", async (request, response) => {
  const { fromPhase, toPhase } = request.body;
  const { pipeId } = request.params;
  const pipefyapi = new Pipefyapi();
  
  if (pipeId == null || fromPhase == null || toPhase == null) {
    return response.json({error: "pipeId, fromPhase, toPhase não podem ser nulos!"});
  }

  try {
    const { data } = await pipefyapi.get_phase(fromPhase);
    const phasesForms = data.data.phase.fields.map(
      ({ id, options, type, required, is_multiple }) =>
        new PhaseForm(id, options, type, required, is_multiple)
    );
   
    const allCards = await pipefyapi.get_all_cards(pipeId, fromPhase);
    await pipefyapi.moveCardToPhase(allCards.map(c => c.node.id), toPhase);
    
    response.json({message: "Cards foram movidos com sucesso!"});
  } catch (e) {
    response.status(500).json(e);
  }
});


app.post("/pipes/:pipeId/phases/:phaseId/update_fields", async (request, response) => {
  const { field_value } = request.body;
  const { pipeId, phaseId } = request.params;
  const pipefyapi = new Pipefyapi();
  
  if (pipeId == null || phaseId == null) {
    return response.json({error: "O pipeId e o phaseId não podem ser nulos!"});
  }

  try {
    const { data } = await pipefyapi.get_phase(phaseId);
    const phasesForms = data.data.phase.fields.map(
      ({ id, options, type, required, is_multiple }) =>
        new PhaseForm(id, options, type, required, is_multiple)
    );
   
    const allCards = await pipefyapi.get_all_cards(pipeId, phaseId);
    const cardService = new CardsService(phasesForms, allCards.map(c => c.node), pipefyapi);
    
    await cardService.updateCardsFields(field_value);
    response.json({message: "Cards foram atualizados com sucesso!"});
  } catch (e) {
    response.status(500).json({error: e});
  }
});


app.get("/phases/:phaseId", async (request, response) => {
  const phaseId = request.params.phaseId;
  const pipefyapi = new Pipefyapi();

  try {
    const { data } = await pipefyapi.get_phase(phaseId);
    response.json(data.data);
  } catch (e) {
    response.json(e);
  }
});


const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}. 🚢`);
});
