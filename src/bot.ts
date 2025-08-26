import {factory} from "./factories/factory";
import {createServer} from "./server";


async function main() {
    try {
        await factory.ServiceFactory.createRedisService().connect();
        const baileysService = factory.ServiceFactory.createBaileysService();
        const qrState = {qr: null as string | null};
        createServer(qrState);
        const connectToWhatsApp = async () => {
            try {
                await baileysService.execute(qrState, connectToWhatsApp);
            } catch (err) {
                console.error('[Bot] Falha ao conectar com o WhatsApp. Tentando novamente em 15 segundos...', err);
                await new Promise(resolve => setTimeout(resolve, 15000));
                await connectToWhatsApp();
                const cronService = factory.ServiceFactory.createCronService(baileysService);
                cronService.start();
            }
        };
        await connectToWhatsApp();
        const replyWorker = factory.WorkerFactory.createReplyWorker(baileysService);
        await replyWorker.processTask()
    } catch (err) {
        console.error("[Bot] Um erro crítico ocorreu durante a inicialização: ", err);
        process.exit(1);
    }
}

main().catch(err => console.error("[Bot] Erro inesperado na inicialização:", err));