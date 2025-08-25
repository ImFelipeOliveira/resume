import {RedisClient} from "./services/redis-service";
import {GeminiService} from "./services/ai-service";
import {CommandHandler} from "./handlers/command-handler";
import {MessageHandler} from "./handlers/message-handler";
import makeWASocket, {DisconnectReason, useMultiFileAuthState, WASocket} from "@whiskeysockets/baileys";
import {pino} from "pino";
import {Boom} from "@hapi/boom";
import {toString} from "qrcode";

async function startBot() {
    // Instancia os serviços
    const redisClient = new RedisClient()
    await redisClient.connect()
    const geminiService = new GeminiService()
    // Instancia handlers
    const commandHandler = new CommandHandler(redisClient, geminiService);
    const messageHandler = new MessageHandler(redisClient, commandHandler);

    const {state, saveCreds} = await useMultiFileAuthState('auth_info_baileys')
    const sock: WASocket = makeWASocket({
        logger: pino({level: 'silent'}),
        auth: state,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const {connection, lastDisconnect, qr} = update;

        if (qr) {
            console.log('QR Code recebido, escaneie com seu celular:');
            toString(qr, {type: "terminal", small: true}, (err, url) => {
                console.log(url)
            })
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Motivo:', lastDisconnect?.error, '. Reconectando:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot conectado com sucesso! 🤖');
        }
    });

    // 4. Delegar o evento de mensagem para a instância do MessageHandler
    sock.ev.on('messages.upsert', (m) => messageHandler.handleMessage(sock, m));
}

startBot().catch(err => console.error("Erro inesperado ao iniciar o bot:", err));