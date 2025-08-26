import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {env} from "../../config/env";
import {IServiceFactory} from "../../services/interfaces/IService-factory";
import {GeminiService} from "../../services/ai-service";

export class SummaryWorker {
    private readonly rabbitMQ: Promise<RabbitMQ>;
    private geminiService: GeminiService;
    private queueName: string = env.rabbitmq.queues.summary!

    constructor(private adapterFactory: IAdapterFactory, private serviceFactory: IServiceFactory) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
        this.geminiService = this.serviceFactory.createGeminiService()
    }

    async processTask() {
        const adapter = await this.rabbitMQ;
        await adapter.consume(this.queueName, async () => {

        })
    }
}