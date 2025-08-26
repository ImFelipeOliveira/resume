import {GroupMetadata, proto, WASocket} from "@whiskeysockets/baileys";
import {MessageData, RedisClientService} from "../services/redis-service";
import {GeminiService} from "../services/ai-service";
import {IFactory} from "../factories/interfaces/IFactory";
import {SummaryQueue} from "../message-broker/queue/summary-queue";

export class CommandHandler {
    private redisClient: RedisClientService;
    private summaryQueue: SummaryQueue;

    constructor(private factory: IFactory) {
        this.redisClient = factory.ServiceFactory.createRedisService()
        this.summaryQueue = factory.QueueFactory.createSummaryQueue()
    }

    parseDateFromArgs(args: string[]): Date | null {
        if (args.length === 0) {
            return new Date();
        }
        const dateParts = args[0].split('-');
        if (dateParts.length !== 3) return null;
        const [day, month, year] = dateParts;
        const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
        if (isNaN(date.getTime())) return null;
        return date;
    }

    async commandHandler(sock: WASocket, message: proto.IWebMessageInfo, text: string): Promise<void> {
        const groupId = message.key.remoteJid!;
        const [command, ...args] = text.trim().substring(1).split(/\s+/);
        let targetDate: Date | null;
        let groupMetadata: GroupMetadata;
        let groupName: string;

        switch (command.toLowerCase()) {
            case 'resume':
            case 'resumo':
                targetDate = this.parseDateFromArgs(args);
                if (!targetDate) {
                    return;
                }
                const messages: MessageData[] = await this.redisClient.getMessagesByDate(groupId, targetDate);
                if (messages.length === 0) {
                    const dateString = targetDate.toLocaleDateString('pt-BR');
                    const responseText = args.length > 0 ? `Nenhuma mensagem registrada na data ${dateString}.` : 'Nenhuma mensagem registrada hoje.';
                    await sock.sendMessage(groupId, {text: responseText});
                    return;
                }
                groupMetadata = await sock.groupMetadata(groupId);
                groupName = groupMetadata.subject;
                await sock.sendMessage(groupId, {text: `Ok! ${groupName}, estou preparando o resumo... 🧠`});
                await this.summaryQueue.enqueue({groupId: groupId, message: messages})
                break;
            default:
                await sock.sendMessage(groupId, {text: 'Comando não reconhecido.'});
                break;
        }
    }
}