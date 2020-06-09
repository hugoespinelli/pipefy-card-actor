const express =  require("express");

const compression = require("compression");
const cors = require("cors");
const app = express();
const Pipefyapi = require("./back/api.js");

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

app.get("/pipes/public/registered_candidates", async (request, response) => {
  const PUBLIC_PIPE_ID = 1175536;
  const REGISTERED_CANDIDATES_PHASE_ID = 7862849;
  const pipefyapi = new Pipefyapi();
  
  try {
    const allCards = await pipefyapi.get_all_cards(PUBLIC_PIPE_ID, REGISTERED_CANDIDATES_PHASE_ID);
    response.json(allCards);
  } catch(e) {
    response.json(e);
  }
  
  
});

app.get("/pipes/:pipeId/cards", async (request, response) => {
  const pipeId = request.params.pipeId;
  const { phase } = request.query;
  const pipefyapi = new Pipefyapi();
  
  try {
    const allCards = await pipefyapi.get_all_cards(pipeId, phase);
    response.json(allCards);
  } catch(e) {
    response.json(e);
  }
  
  
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}. 🚢`);
});
