import {RabbitMQ} from "../../adapters/rabbitmq";
import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {env} from "../../config/env";
import {IServiceFactory} from "../../services/interfaces/IService-factory";
import {GeminiService} from "../../services/ai-service";
import {taskPayload} from "../queue/summary-queue";
import {ReplyQueue} from "../queue/reply-queue";
import {IQueueFactory} from "../queue/interfaces/IQueue-factory";

export interface replyPayload {
    groupId: string;
    message: string;
}

export class SummaryWorker {
    private readonly rabbitMQ: Promise<RabbitMQ>;
    private geminiService: GeminiService;
    private replyQueue: ReplyQueue;
    private queueName: string = env.rabbitmq.queues.summary!

    constructor(
        private adapterFactory: IAdapterFactory,
        private serviceFactory: IServiceFactory,
        private queueFactory: IQueueFactory
    ) {
        this.rabbitMQ = this.adapterFactory.createRabbitMQAdapter()
        this.geminiService = this.serviceFactory.createGeminiService()
        this.replyQueue = this.queueFactory.createReplyQueue()
    }

    async processTask() {
        const adapter = await this.rabbitMQ;
        await adapter.consume(this.queueName, async (msg: any) => {
            const input: taskPayload = JSON.parse(msg.content.toString())
            if (typeof input.message === "string") {
                const message = await this.geminiService.customPrompt(input.message)
                await this.sendToReply({groupId: input.groupId, message})
            } else {
                const message = await this.geminiService.summarizeMessages(input.message)
                await this.sendToReply({groupId: input.groupId, message})
            }
        })
    }

    private async sendToReply(message: replyPayload) {
        await this.replyQueue.enqueue(message)
    }
}