import {BaileysService} from "./baileys-service";
import {IServiceFactory} from "./interfaces/IService-factory";
import {RedisClientService} from "./redis-service";
import cron from "node-cron"
import {SummaryQueue} from "../message-broker/queue/summary-queue";
import {IQueueFactory} from "../message-broker/queue/interfaces/IQueue-factory";


export class CronService {
    private redisService: RedisClientService;
    private summaryQueue: SummaryQueue;

    constructor(
        private readonly baileysService: BaileysService,
        private serviceFactory: IServiceFactory,
        private queueFactory: IQueueFactory
    ) {
        this.redisService = this.serviceFactory.createRedisService()
        this.summaryQueue = this.queueFactory.createSummaryQueue()
    }

    start() {
        this.scheduleGoodMorningMessage()
    }

    private scheduleGoodMorningMessage() {
        const GROUPS_KEY = 'bot:groups';

        cron.schedule('0 7 * * *', async () => {
            try {
                const groupIds = await this.redisService.getSetMembers(GROUPS_KEY);

                if (!groupIds || groupIds.length === 0) {
                    console.log('[CronService] Nenhum grupo encontrado no Redis para a tarefa de "Bom dia".');
                    return;
                }
                for (const groupId of groupIds) {
                    try {
                        const groupMetadata = await this.baileysService.getGroupMetadata(groupId)
                        const groupName = groupMetadata.subject
                        const prompt = `Você é um bot de um grupo de WhatsApp.  
                            Esta deve ser uma mensagem automática que é enviada todos
                            os dias as 7:00.
                            
                            Responda **exatamente nesse formato**:  
                            
                            Bom dia, ${groupName} ☀️  
                            Logo abaixo, escreva uma mensagem motivacional curta (2 a 3 frases),  
                               no estilo de correntes de WhatsApp de pessoas idosas:  
                               - linguagem simples e positiva  
                               - incluir emojis (flores, sol, café, corações etc.)  
                               - trazer uma ideia de esperança, paz ou alegria para o dia.  
                              
                            Informe que está é uma mensagem automática.
                            Não adicione nada além disso.
                            `
                        await this.summaryQueue.enqueue({groupId: groupId, message: prompt})
                    } catch (error) {
                        console.error("[CronService] Erro ao executar buscar dados para tarefa: ", error)
                    }
                }
            } catch (error) {
                console.error('[CronService] Erro ao executar a tarefa de "Bom dia":', error);
            }
        }, {
            timezone: "America/Manaus"
        });
    }
}