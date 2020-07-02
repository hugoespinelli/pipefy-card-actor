const Pipefyapi = require("./api");
const LateCardsService = require("./movelatecardservice");

module.exports = class MoveLateCardsController {

    constructor(pipeId) {
        this.pipeId = pipeId;
        this.pipefyapi = new Pipefyapi();
    }

    async moveCardsToFrom(fromPhase, toPhase) {

        console.log(`[${new Date()}] - Iniciando Cron do pipe ${this.pipeId}...`);
        console.log(`Movendo da fase ${fromPhase} para ${toPhase}...`);
        let pipeInfo = null;

        try {
            const { data } = await this.pipefyapi.get_pipe_info(this.pipeId);
            pipeInfo = data.data.pipe;
        } catch (e) {
            console.log('Error pra pegar info do pipe');
            return;
        }
        const lateCardsService = new LateCardsService(pipeInfo.phases);
        const phaseFound = lateCardsService.findPhase(fromPhase);

        if (!phaseFound || phaseFound.lateCardsCount === 0) {
            console.log("Não há cards atrasados...");
            return;
        }

        const phaseId = phaseFound.id;
        const allCards = await this.pipefyapi.get_all_cards(this.pipeId, phaseId);
        let lateCards = lateCardsService.filterLateCards(allCards.map(c => c.node));

        if (lateCards.length === 0) {
            console.log("Não há cards atrasados...");
            return;
        }
        const phaseCardsToBeMoved = lateCardsService.findPhase(toPhase);
        if (!phaseCardsToBeMoved) {
            console.log(`Pipe não possui a fase de ${lateCardsService.phaseToBeMovedIfCardsAreLate}`);
            return;
        }
        console.log(`Foram movidos ${lateCards.length}`);
        return await this.pipefyapi.moveCardsToPhase(lateCards.map(c => c.id), phaseCardsToBeMoved.id);

    }

};