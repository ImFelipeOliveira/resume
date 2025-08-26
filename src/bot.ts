import {factory} from "./factories/factory";
import {createServer} from "./server";

async function start() {
    try {
        console.log('[Bot] Initializing...');
        await factory.ServiceFactory.createRedisService().connect();

        const baileysService = factory.ServiceFactory.createBaileysService()
        const qrState = {qr: null as string | null};
        createServer(qrState);
        await baileysService.execute(qrState, start);
        console.log('[Bot] Conexão estabelecida. Iniciando o Reply Worker...');
        const replyWorker = factory.WorkerFactory.createReplyWorker(baileysService);
        await replyWorker.processTask()
    } catch (err) {
        console.error("[Bot] Um erro crítico ocorreu durante a inicialização: ", err);
        process.exit(1);
    }
}

start().catch(err => console.error("[Bot] Erro inesperado na inicialização:", err));