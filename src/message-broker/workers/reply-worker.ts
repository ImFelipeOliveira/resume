import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {env} from "../../config/env";
import {replyPayload} from "./summary-worker";
import {BaileysService} from "../../services/baileys-service";

export class ReplyWorker {
    private readonly rabbitMQ: Promise<RabbitMQ>
    private readonly queueName: string = env.rabbitmq.queues.reply!

    constructor(private adapterFactory: IAdapterFactory, private baileysService: BaileysService) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
    }

    async processTask() {
        const adapter = await this.rabbitMQ
        await adapter.consume(this.queueName, async (msg: any) => {
            const input: replyPayload = JSON.parse(msg)
            await this.baileysService.sendMessage(input.groupId, input.message)
        })
    }
}