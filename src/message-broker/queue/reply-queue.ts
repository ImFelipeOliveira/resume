import {env} from "../../config/env";
import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {IServiceFactory} from "../../services/interfaces/IService-factory";
import {BaileysService} from "../../services/baileys-service";
import {replyPayload} from "../workers/summary-worker";

export class ReplyQueue {
    private readonly queueName: string = env.rabbitmq.queues.reply!
    private readonly rabbitMQ: Promise<RabbitMQ>;
    private baileyService: BaileysService

    constructor(private adapterFactory: IAdapterFactory, private serviceFactory: IServiceFactory) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
        this.baileyService = this.serviceFactory.createBaileysService()
    }

    async enqueue(payload: replyPayload) {
        const adapter = await this.rabbitMQ
        await adapter.sendToQueue(this.queueName, JSON.stringify(payload))
    }
}