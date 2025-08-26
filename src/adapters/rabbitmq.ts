import {RabbitMQAdapter} from "./rabbtmq-adapter";
import {Channel, ChannelModel} from "amqplib";

export class RabbitMQ {
    private rabbitMQ: RabbitMQAdapter
    private readonly connection: ChannelModel;
    private readonly channel: Channel;

    private constructor(rabbitMQ: RabbitMQAdapter) {
        this.rabbitMQ = rabbitMQ;
        this.connection = this.rabbitMQ.getConnection()!;
        this.channel = this.rabbitMQ.getChannel()!;
    }

    static async create(): Promise<RabbitMQ> {
        const rabbitMQAdapter: RabbitMQAdapter = await RabbitMQAdapter.create();
        return new RabbitMQ(rabbitMQAdapter);
    }

    async sendToQueue(queue: string, message: string): Promise<void> {
        await this.channel.assertQueue(queue, {durable: true});
        this.channel.sendToQueue(queue, Buffer.from(message));
    }

    async consume(queue: string, callback: (msg: string) => void): Promise<void> {
        await this.channel.assertQueue(queue, {durable: true});
        await this.channel.consume(queue, (msg) => {
            if (msg !== null) {
                callback(msg.content.toString());
                this.channel.ack(msg);
            }
        });
    }

    async close(): Promise<void> {
        await this.rabbitMQ.close({
            connection: this.connection,
            channel: this.channel,
        });
    }

    getConnection(): ChannelModel | null {
        return this.connection;
    }

    nack(msg: any, allUpTo?: boolean) {
        this.channel.nack(msg, allUpTo)
    }

    ack(msg: any) {
        this.channel.ack(msg)
    }
}