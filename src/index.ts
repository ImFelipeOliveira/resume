import {createServer} from "./server";
import {factory} from "./factories/factory";


async function startBot() {
    try {
        await factory.ServiceFactory.createRedisService().connect()
        const baileysService = factory.ServiceFactory.createBaileysService()
        const qrState = {qr: null as string | null};
        createServer(qrState)
        await baileysService.execute(qrState, startBot);
    } catch (err) {
        console.error("An error ocurred: ", err)
        throw new Error("An error ocurred")
    }

}

startBot().catch(err => console.error("Erro inesperado ao iniciar o bot:", err));