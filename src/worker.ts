import {factory} from "./factories/factory";

async function start() {
    try {
        console.log('[Worker] Initializing...');
        const summaryWorker = factory.WorkerFactory.createSummaryWorker();
        await summaryWorker.processTask();
    } catch (err) {
        console.error("[Worker] Erro ao iniciar worker:", err);
        process.exit(1);
    }
}

start().catch(err => console.error("[Worker] Erro inesperado na inicialização:", err));