require('dotenv').config();
const express = require("express");

const compression = require("compression");
const cors = require("cors");
const app = express();
const cron = require('node-cron');

const MoveLateCardsService = require("./back/movelatecardservice");
const LMSApiService = require("./back/services/lms/lmsapiservice");
const LabelService = require("./back/services/label/labelservice");
const PipeService = require("./back/services/piper/pipeservice");
const CardService = require("./back/services/cards/cardsservice");
const MoveLateCardsController = require("./back/movelatecardscontroller");
const GeneralPipeController = require("./back/generalpipecontroller");
const AddLabelCardController = require("./back/controllers/addlabelcardcontroller");
const FeedbackController = require("./back/controllers/feedbackcontroller");
const MoverController = require("./back/controllers/movercontroller");
const PhaseController = require("./back/controllers/phasecontroller");
const pipefyapi = require("./back/api.js");
const PhaseForm = require("./back/phaseform.js");
const FormService = require("./back/cardservice.js");
const { convert_date, addDays } = require("./back/utils");
const { LABEL_OPTIONS } = require("./back/services/label/consts");

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

app.post("/pipes/:pipeId/move_cards_ids", async (request, response) => {
    const { toPhaseName, cardsIds } = request.body;
    const { pipeId } = request.params;

    if (pipeId == null || toPhaseName == null) {
        return response.json({error: "pipeId, toPhaseName não podem ser nulos!"});
    }

    const moveController = new MoverController(pipeId);

    try {
        await moveController.moveCardsToPhaseName(cardsIds, toPhaseName);
        response.json({message: "Cards foram movidos com sucesso!"});
    } catch (e) {
        response.status(500).json(e);
    }
});

app.post("/pipes/:pipeId/cards/:cardId/send_feedback", async (request, response) => {
    const { reason } = request.body;
    const { pipeId, cardId } = request.params;

    if (pipeId == null || cardId == null || reason == null) {
        return response.json({error: "pipeId, cardId ou reason não podem ser nulos!"});
    }

    const pipeService = new PipeService(pipeId);
    try {
        var { pipe } = await pipeService.getInfo();
    } catch (e) {
        return response.status(500).json(e);
    }


    const feedbackController = new FeedbackController([], pipe);

    try {
        await feedbackController.sendFeedback(cardId, reason);
        return response.json({message: "Feedback dos cards foram enviados com sucesso!!"});
    } catch (e) {
        return response.status(500).json(e);
    }
});

app.post("/pipes/:pipeId/phases/:phaseId/update_fields", async (request, response) => {
    const { field_value } = request.body;
    const { pipeId, phaseId} = request.params;

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
        const cardService = new FormService(phasesForms, allCards.map(c => c.node), pipefyapi);

        await cardService.updateCardsFields(field_value);

        response.json({message: "Cards foram atualizados com sucesso!"});
    } catch (e) {
        response.status(500).json({error: e});
    }
});

app.get("/phases/:phaseId", async (request, response) => {
    const phaseId = request.params.phaseId;

    try {
        const { data } = await pipefyapi.get_phase(phaseId);
        response.json(data.data);
    } catch (e) {
        response.json(e);
    }
});

app.get("/table/:tableId", async (request, response) => {
    const { tableId } = request.params;

    try {
        const table = await pipefyapi.getTable(tableId);
        response.json(table);
    } catch (e) {
        response.json(e);
    }
});

cron.schedule('*/20 * * * *', async () => {

    const step_completed_process = "F3: Processo completo";
    const first_step_register = "F1: Completar cadastro";
    const second_step_register = "F1: Completar cadastro2 (*)";
    const third_step_register = "F1: Completar cadastro3";
    const first_step_potential = "F4: Potencial";
    const second_step_potential = "F4: Potencial2";
    const third_step_potential = "F4: Potencial3";
    const step_analysis = "F6: Análise";

    const FEEDBACK_REASON = 'perfil técnico';

    const tableRecords = await pipefyapi.getPipeIdsFromDatabase();
    const pipeIds = tableRecords.map(t => parseInt(t.node.title));

    pipeIds.map(async pipeId => {

        console.log(`Começou movimentação de cards das fases Completar cadastro/Processo completo/Potencial ${pipeId}...`);

        const moverController = new MoverController(pipeId);
        try {
            await Promise.all([
                moverController.moveLateCardsFromTo(first_step_register, second_step_register),
                moverController.moveLateCardsFromTo(second_step_register, third_step_register),
                moverController.moveLateCardsFromTo(first_step_potential, second_step_potential),
                moverController.moveLateCardsFromTo(second_step_potential, third_step_potential),
                moverController.moveCardsToPhaseNameAndFillFeedback(third_step_potential, step_analysis, FEEDBACK_REASON),
                moverController.moveCardsToPhaseNameAndFillFeedback(step_completed_process, step_analysis, FEEDBACK_REASON),
            ]);
        } catch (e) {
            console.log(e);
        }
        console.log(`Terminou movimentação de cards das fases Completar cadastro/Processo completo/Potencial ${pipeId}`);

    });

});

cron.schedule("0,30 * * * *", async () => {

    const tableRows = await pipefyapi.getPipeIdsFromDatabase();

    const PHASES_TO_BE_MOVED = ["F1: Candidato da base", "F1: Cadastro completo"];
    const END_PHASE = "F2: Confirmação";

    console.log('Começou cron de mover cards candidato da base e cadastro completo para confirmação');

    await Promise.all(tableRows.map(async ({node}) => {

        const pipeId = node.title;
        const { data } = await pipefyapi.get_pipe_info(pipeId);
        const phases = data.data.pipe.phases;

        const phasesToBeMoved = phases.filter(phase => PHASES_TO_BE_MOVED.includes(phase.name));
        const endPhase = phases.find(phase => phase.name === END_PHASE);
        const phasesIdsToGet = phasesToBeMoved.map(phase => phase.id);

        if (!endPhase) {
            console.log(`O pipe ${pipeId} não possui a fase ${END_PHASE} cadastrada!`);
            return Promise.resolve();
        }

        let allCards = [], potentialCardsIds = [];
        try {
            allCards = await pipefyapi.get_all_cards(pipeId, phasesIdsToGet, true);
            potentialCardsIds = allCards
                .filter(c => c.node.labels.some(label => label.name === LABEL_OPTIONS.POTENCIAL))
                .map(c => c.node.id);
        } catch (e) {
            console.log('excecao', e);
        }

        try {
            return pipefyapi.moveCardsToPhase(potentialCardsIds, endPhase.id);
        } catch (e) {
            console.log(e);
        }

    }));

    console.log('Terminando cron de mover cards candidato da base e cadastro completo para confirmação');

    console.log('Começando cron de movimentação cadastro completo para inicio da jornada');

    const TABLE_ID = "BhE5WSrq";

    const REGISTER_COMPLETED_PHASE = "F1: Cadastro completo";
    const BEGIN_JOURNEY_PHASE = "F2: Início da jornada";

    const rows = await pipefyapi.getTable(TABLE_ID);
    const pipeIds = rows.map(row => parseInt(row.node.title));

    await Promise.all(
        pipeIds.map(async pipeId => {

            const phaseController = new PhaseController(pipeId);
            const cardService = new CardService(pipeId);

            let cards = await cardService.getCardsFromPhase(REGISTER_COMPLETED_PHASE);
            cards = cards.map(c => c.node);
            cards = cardService.filterByLabel(cards, LABEL_OPTIONS.POTENCIAL);
            await Promise.all([
                await phaseController.updateCardsFormValue(cards, REGISTER_COMPLETED_PHASE),
                await phaseController.updateCardsDueDate(cards, REGISTER_COMPLETED_PHASE),
            ]);


            console.log(`Atualizou data limite de ${cards.length}`);

            const moverController = new MoverController(pipeId);
            return moverController.moveCardsToPhaseName(cards.map(c => c.id), BEGIN_JOURNEY_PHASE)

        })
    );

    console.log('Terminando cron de movimentação cadastro completo para inicio da jornada');

});


cron.schedule("5,25,50 * * * *", async () => {

    const GENERAL_PIPE_ID = 1175536;

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
                return generalPipeController.connectGeneralPipe(enrollCard);
            })
        );

        allCards = await generalPipeController.getCardsFromEnrollPhases(pipeId);
        allCards = allCards.filter(c => CardService.isCardConnected(c));
        await Promise.all(
            allCards.map( card => generalPipeController.moveCardToCompletedProcess(card))
        );

    });

    console.log('Terminando cron de conexão de cards de candidadtos cadastrados');

});

cron.schedule("*/20 * * * *", async () => {

    console.log("Começou cron de etiquetação de cards...");

    const TABLE_ID = "BhE5WSrq";

    const rows = await pipefyapi.getTable(TABLE_ID);
    const pipeIds = rows.map(row => parseInt(row.node.title));

    await Promise.all(
        pipeIds.map(async pipeId => {

            const addLabelCardController = new AddLabelCardController(pipeId, TABLE_ID);
            await addLabelCardController.build();

            console.log(`Etiquetando cards potenciais e eliminados do pipe ${pipeId}...`);
            await addLabelCardController.fillEliminatedCardsLabelsInPipe();
            console.log("Finalizada etiquetacao de cards potenciais e eliminados.");

            const feedbackController = new FeedbackController(addLabelCardController.cards, addLabelCardController.pipe);
            await Promise.all([
                await feedbackController.updateCardFeedback(),
                await feedbackController.moveCardsToEliminatedPhase(),
            ]);
        })
    );

    console.log("Finalizada cron de etiquetação de cards.");
});


cron.schedule("0 13 * * *", async () => {

    console.log("Começou cron de movimentação de cards de feedback...");

    const TABLE_ID = "BhE5WSrq";
    const ELIMINATED_CANDIDATES_PHASE = "F6: Análise";
    const FEEDBACK_CANDIDATES_PHASE = "F6: [Feedback] Eliminado";

    const rows = await pipefyapi.getTable(TABLE_ID);
    const pipeIds = rows.map(row => parseInt(row.node.title));

    await Promise.all(
        pipeIds.map(pipeId => {

            const moverController = new MoverController(pipeId);
            return moverController.moveLateCardsFromTo(ELIMINATED_CANDIDATES_PHASE, FEEDBACK_CANDIDATES_PHASE);

        })
    );

    console.log("Finalizada cron de movimentação de cards de feedback.");

});


cron.schedule("0 */1 * * *", async () => {

    console.log("Começou cron de movimentação de cards de follow up...");

    const TABLE_ID = "BhE5WSrq";

    const FOLLOW_UPS_PHASES = [
        "F2: Follow up #2d (*)",
        "F2: Follow up #1d",
        "F2: Última Chance",
    ];

    const BEGIN_JOURNEY_PHASE = "F2: Início da jornada";
    const PROCESS_NOT_COMPLETED_PHASE = "F3: Processo não completo";
    const ELIMINATED_PHASE = "F6: Análise";

    const rows = await pipefyapi.getTable(TABLE_ID);
    const pipeIds = rows.map(row => parseInt(row.node.title));

    await Promise.all(
        pipeIds.map(async pipeId => {

            const moverController = new MoverController(pipeId);
            return Promise.all([
                moverController.moveLateCardsFromTo(BEGIN_JOURNEY_PHASE, FOLLOW_UPS_PHASES[0]),
                moverController.moveLateCardsFromTo(FOLLOW_UPS_PHASES[0], FOLLOW_UPS_PHASES[1]),
                moverController.moveLateCardsFromTo(FOLLOW_UPS_PHASES[1], PROCESS_NOT_COMPLETED_PHASE),
                moverController.moveLateCardsFromTo(FOLLOW_UPS_PHASES[2], PROCESS_NOT_COMPLETED_PHASE),
                moverController.moveLateCardsFromTo(PROCESS_NOT_COMPLETED_PHASE, ELIMINATED_PHASE),
            ]);

        })
    );

    console.log("Finalizada cron de movimentação de cards de feedback.");

});


cron.schedule("15,30,45 * * * *", async () => {

    console.log("Começou cron de mapeamento de avaliacoes LMS...");

    const lmsApiService= new LMSApiService();

    try {
        const response = await lmsApiService.search_lms();
        console.log(response);
    } catch (e) {
        console.log(e);
    }

    console.log("Finalizada cron de mapeamento de avaliacoes LMS.");

});

const listener = app.listen(process.env.PORT, () => {
    console.log(`Your app is listening on port ${listener.address().port}. 🚢`);
});
