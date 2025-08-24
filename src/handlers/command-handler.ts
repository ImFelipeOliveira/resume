import {proto, WASocket} from "@whiskeysockets/baileys";
import {RedisClient} from "../services/redis-service";
import {GeminiService} from "../services/ai-service";

export class CommandHandler {
    constructor(private readonly redisClient: RedisClient, private readonly aiService: GeminiService) {
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

        switch (command.toLowerCase()) {
            case 'resume':
            case 'resumo':
                const targetDate = this.parseDateFromArgs(args);

                if (!targetDate) {
                    await sock.sendMessage(groupId, {text: 'Formato de data inválido. Use DD-MM-YYYY.'});
                    return;
                }

                const messages = await this.redisClient.getMessagesByDate(groupId, targetDate);

                if (messages.length === 0) {
                    const dateString = targetDate.toLocaleDateString('pt-BR');
                    const responseText = args.length > 0 ? `Nenhuma mensagem registrada na data ${dateString}.` : 'Nenhuma mensagem registrada hoje.';
                    await sock.sendMessage(groupId, {text: responseText});
                    return;
                }

                const groupMetadata = await sock.groupMetadata(groupId);
                const groupName = groupMetadata.subject;

                await sock.sendMessage(groupId, {text: `Ok, *${groupName}*, estou preparando o resumo... 🧠`});
                const summary = await this.aiService.summarizeMessages(messages);
                await sock.sendMessage(groupId, {text: `*Resumo:\n\n${summary}`});
                break;

            default:
                await sock.sendMessage(groupId, {text: 'Comando não reconhecido.'});
                break;
        }
    }
}