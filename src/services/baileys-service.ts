import {IFactory} from "../factories/interfaces/IFactory";
import {MessageHandler} from "../handlers/message-handler";
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket
} from "@whiskeysockets/baileys";
import {pino} from "pino";
import {toString} from "qrcode";
import {Boom} from "@hapi/boom";

export class BaileysService {
    private messageHandler: MessageHandler;

    constructor(private factory: IFactory) {
        this.messageHandler = this.factory.HandlerFactory.createMessageHandler()
    }

    async execute(qrState: { qr: string | null }, startBot: Function) {
        const {state, saveCreds} = await useMultiFileAuthState('auth_info_baileys')
        const sock: WASocket = makeWASocket({
            logger: pino({level: 'silent'}),
            auth: state,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const {connection, lastDisconnect, qr} = update;

            qrState.qr = qr ?? null;

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
        sock.ev.on('creds.update', saveCreds);
        // 4. Delegar o evento de mensagem para a instância do MessageHandler
        sock.ev.on('messages.upsert', (m) => this.messageHandler.handleMessage(sock, m));
    }
}