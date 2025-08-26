import {IFactory} from "../factories/interfaces/IFactory";
import {MessageHandler} from "../handlers/message-handler";
import makeWASocket, {
    DisconnectReason, GroupMetadata,
    useMultiFileAuthState,
    WASocket
} from "@whiskeysockets/baileys";
import {pino} from "pino";
import {toString} from "qrcode";
import {Boom} from "@hapi/boom";
import {RedisClientService} from "./redis-service";

export class BaileysService {
    private messageHandler: MessageHandler;
    private sock: WASocket | null = null;
    private redisService: RedisClientService;

    constructor(private factory: IFactory) {
        this.redisService = this.factory.ServiceFactory.createRedisService();
        this.messageHandler = this.factory.HandlerFactory.createMessageHandler()
    }

    execute(qrState: { qr: string | null }, startBot: Function) {
        return new Promise<void>(async (resolve, reject) => {
            const {state, saveCreds} = await useMultiFileAuthState('auth_info_baileys')
            this.sock = makeWASocket({
                logger: pino({level: 'silent'}),
                auth: state,
            });
            this.sock.ev.on('creds.update', saveCreds);
            this.sock.ev.on('connection.update', async (update) => {
                const {connection, lastDisconnect, qr} = update;
                qrState.qr = qr ?? null;
                if (qr) {
                    console.log('QR Code recebido, escaneie com seu celular:');
                    toString(qr, {type: "terminal", small: true}, (err, url) => {
                        if (err) {
                            console.error('Erro ao gerar QR Code:', err)
                            throw new Error('Erro ao gerar QR Code')
                        }
                        console.log(url)
                    })
                }
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.info('Conexão fechada. Motivo:', lastDisconnect?.error, '. Reconectando:', shouldReconnect);
                    if (shouldReconnect) startBot();
                    else reject(new Error("Conexão fechada permanentemente."));
                } else if (connection === 'open') {
                    console.info('[BaileysService] Bot conectado com sucesso! 🤖');
                    const groups = await this.sock!.groupFetchAllParticipating()
                    const groupIds = Object.keys(groups)
                    if (groupIds.length > 0)
                        await this.redisService.addToSet("bot:groups", groupIds)
                    resolve()
                }
            });
            // 4. Delegar o evento de mensagem para a instância do MessageHandler
            this.sock.ev.on('messages.upsert', (m) => this.messageHandler.handleMessage(this.sock!, m));
        })
    }

    async sendMessage(groupId: string, message: string) {
        if (!this.sock) throw new Error("Bot não conectado")
        await this.sock.sendMessage(groupId, {text: message})
    }

    async getGroupMetadata(groupId: string): Promise<GroupMetadata> {
        if (!this.sock)
            throw new Error("Bot não conectado");
        return this.sock.groupMetadata(groupId);
    }
}