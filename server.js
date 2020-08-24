require('dotenv').config();
const express = require("express");

const compression = require("compression");
const cors = require("cors");
const app = express();
const cron = require('node-cron');

const MoveLateCardsService = require("./back/movelatecardservice");
const MoveLateCardsController = require("./back/movelatecardscontroller");
const GeneralPipeController = require("./back/generalpipecontroller");
const Pipefyapi = require("./back/api.js");
const PhaseForm = require("./back/phaseform.js");
const CardsService = require("./back/cardservice.js");
const LabelService = require("./back/services/label/labelservice");
const AddLabelCardController = require("./back/controllers/addlabelcardcontroller");
const { convert_date, addDays } = require("./back/utils");

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

app.get("/pipes/:pipeId", async (request, response) => {
    const pipeId = request.params.pipeId;
    const pipefyapi = new Pipefyapi();

    try {
        const { data } = await pipefyapi.get_pipe_info(pipeId);
        response.json({pipe: data.data.pipe});
    } catch (e) {
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
    const { fromPhase, toPhase, shouldUpdateDueDate} = request.body;
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
        const cardsIds = allCards.map(c => c.node.id);
        await pipefyapi.moveCardsToPhase(cardsIds, toPhase);

        if (shouldUpdateDueDate) {
            const phaseFormToGenerateDueDate = phasesForms.find(phase => phase.type === "date");
            if (phaseFormToGenerateDueDate) {
                try {
                    let dueDate = phaseFormToGenerateDueDate.generate_answer();
                    dueDate = addDays(dueDate, 1);
                    await pipefyapi.updateCardsDueDate(cardsIds, convert_date(dueDate));
                } catch (e) {
                    console.log(e);
                }
            }
        }

        response.json({message: "Cards foram movidos com sucesso!"});
    } catch (e) {
        response.status(500).json(e);
    }
});


app.post("/pipes/:pipeId/phases/:phaseId/update_fields", async (request, response) => {
    const { field_value } = request.body;
    const { pipeId, phaseId} = request.params;
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

cron.schedule('*/3 * * * *', async () => {

    const first_step_register = "F1: Completar cadastro";
    const second_step_register = "F1: Completar cadastro2 (*)";
    const third_step_register = "F1: Completar cadastro3";

    const pipefyapi = new Pipefyapi();
    const tableRecords = await pipefyapi.getPipeIdsFromDatabase();
    const pipeIds = tableRecords.map(t => parseInt(t.node.title));

    pipeIds.map(async pipeId => {

        const moveLateCardsController = new MoveLateCardsController(pipeId);
        try {
            await moveLateCardsController.moveCardsToFrom(first_step_register, second_step_register);
            await moveLateCardsController.moveCardsToFrom(second_step_register, third_step_register);
        } catch (e) {
            console.log(e);
        }

    });

});

cron.schedule("*/10 * * * *", async () => {

    const GENERAL_PIPE_ID = 1175536;

    const pipefyapi = new Pipefyapi();

    const tableRecords = await pipefyapi.getPipeIdsFromDatabase();
    const pipeIds = tableRecords.map(t => parseInt(t.node.title));

    console.log('Começou cron de conexão de cards de candidadtos cadastrados');
    let allCards = [];
    try {
        allCards = await pipefyapi.get_all_cards(GENERAL_PIPE_ID, [], true);
        allCards = allCards.map(c => c.node);
    } catch (e) {
        console.log('excecao', e);
    }

    pipeIds.map(async (pipeId) => {

        const { data } = await pipefyapi.get_pipe_info(pipeId);
        const phases = data.data.pipe.phases;

        const generalPipeController = new GeneralPipeController(allCards, phases);

        const enrollCards = await generalPipeController.getCardsFromEnrollPhases(pipeId);
        await Promise.all(
            enrollCards.map(async enrollCard => {
                return generalPipeController.connectGeneralPipeAndMove(enrollCard);
            })
        );
    });

    console.log('Terminando cron de conexão de cards de candidadtos cadastrados');

});


cron.schedule("*/1 * * * *", async () => {

    console.log("Começou cron de etiquetação de cards...");

    const pipefyapi = new Pipefyapi();
    const TABLE_ID = "zY3IsJ6P";

    const rows = await pipefyapi.getTable(TABLE_ID);
    const pipeIds = rows.map(row => parseInt(row.node.title));

    await Promise.all(
        pipeIds.map(async pipeId => {

            const addLabelCardController = new AddLabelCardController(pipeId);
            await addLabelCardController.build();

            console.log("Etiquetando cards potenciais e eliminados...");
            await addLabelCardController.fillEliminatedCardsLabelsInPipe();
            console.log("Finalizada etiquetacao de cards potenciais e eliminados.");

            await addLabelCardController.build();

            console.log("Etiquetando cards que passaram pelo candidato base...");
            await addLabelCardController.fillCandidatoBaseLabelsInPipe();
            console.log("Finalizada etiquetacao de cards que passaram pelo candidato base.");
        })
    );

    console.log("Finalizada cron de etiquetação de cards.");
});

const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}. 🚢`);
});
