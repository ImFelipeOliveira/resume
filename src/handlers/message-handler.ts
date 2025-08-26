import {proto, WASocket} from "@whiskeysockets/baileys";
import {RedisClientService} from "../services/redis-service";
import {CommandHandler} from "./command-handler";
import {IFactory} from "../factories/interfaces/IFactory";

export class MessageHandler {
    private redisClient: RedisClientService
    private commandHandler: CommandHandler

    constructor(
        private factory: IFactory
    ) {
        this.redisClient = this.factory.ServiceFactory.createRedisService()
        this.commandHandler = this.factory.HandlerFactory.createCommandHandler()
    }

    async handleMessage(sock: WASocket, m: { messages: proto.IWebMessageInfo[]; type: any }):
        Promise<void> {
        const message = m.messages[0];
        if (!message.message || message.key.fromMe || !message.key.remoteJid) return;
        const groupId = message.key.remoteJid;
        const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
        if (!groupId.endsWith('@g.us') || !text) return;
        if (text.startsWith('/')) {
            await this.commandHandler.commandHandler(sock, message, text);
        } else {
            await this.redisClient.storeMessage(groupId, {
                author: message.pushName || 'Desconhecido',
                text: text,
                timestamp: Date.now(),
            });
        }
    }
}