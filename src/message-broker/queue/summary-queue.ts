import {env} from "../../config/env";
import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {MessageData} from "../../services/redis-service";

export class SummaryQueue {
    private readonly rabbitMQ: Promise<RabbitMQ>
    private queueName = env.rabbitmq.queues.summary!

    constructor(private adapterFactory: IAdapterFactory) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
    }

    async enqueue(messages: string | MessageData[]) {
        const adapter = await this.rabbitMQ;
        await adapter.sendToQueue(this.queueName, JSON.stringify(messages));
    }
}