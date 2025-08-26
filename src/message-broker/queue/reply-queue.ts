import {env} from "../../config/env";
import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {replyPayload} from "../workers/summary-worker";

export class ReplyQueue {
    private readonly queueName: string = env.rabbitmq.queues.reply!
    private readonly rabbitMQ: Promise<RabbitMQ>;

    constructor(private adapterFactory: IAdapterFactory) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
    }

    async enqueue(payload: replyPayload) {
        const adapter = await this.rabbitMQ
        await adapter.sendToQueue(this.queueName, JSON.stringify(payload))
    }
}