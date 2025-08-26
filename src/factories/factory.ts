import {IFactory} from "./interfaces/IFactory";
import {RabbitMQ} from "../adapters/rabbitmq";
import {GeminiService} from "../services/ai-service";
import {RedisClientService} from "../services/redis-service";
import {CommandHandler} from "../handlers/command-handler";
import {MessageHandler} from "../handlers/message-handler";
import {BaileysService} from "../services/baileys-service";
import {SummaryQueue} from "../message-broker/queue/summary-queue";
import {SummaryWorker} from "../message-broker/workers/summary-worker";


const geminiService = new GeminiService()
const redisService = new RedisClientService()

export const factory: IFactory = {
    AdapterFactory: {
        createRabbitMQAdapter: async () => await RabbitMQ.create()
    },
    ServiceFactory: {
        createGeminiService: () => geminiService,
        createRedisService: () => redisService,
        createBaileysService: () => new BaileysService(factory)
    },
    HandlerFactory: {
        createCommandHandler: () => new CommandHandler(factory),
        createMessageHandler: () => new MessageHandler(factory)
    },
    QueueFactory: {
        createSummaryQueue: () => new SummaryQueue(factory.AdapterFactory)
    },
    WorkerFactory: {
        createSummaryWorker: () => new SummaryWorker(
            factory.AdapterFactory,
            factory.ServiceFactory
        )
    }
}