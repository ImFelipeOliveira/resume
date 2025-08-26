import amqp, {Channel, ChannelModel} from "amqplib";
import {env} from "../config/env";

export class RabbitMQAdapter {
    private connection: ChannelModel | null;
    private channel: Channel | null;
    private url: string = env.rabbitmq.url!

    constructor() {
        this.connection = null;
        this.channel = null
    }

    static async create(): Promise<RabbitMQAdapter> {
        const instance = new RabbitMQAdapter()
        await instance.connect()
        return instance
    }

    async connect() {
        let connected = false;
        let attempts;
        const maxAttempts = 5;
        for (attempts = 0; attempts < maxAttempts && !connected; attempts++) {
            try {
                this.connection = await amqp.connect(this.url);
                this.channel = await this.connection.createChannel();
                connected = true;
            } catch (err) {
                attempts++;
                console.error("Failed to connect to RabbitMQ:", err);
                console.log("Retrying connection to RabbitMQ... Attempt: ", attempts);
                await new Promise((res) => setTimeout(res, 2000));
            }
        }
    }

    async close(args: {
        connection: ChannelModel;
        channel: Channel;
    }): Promise<void> {
        await args.channel.close();
        await args.connection.close();
    }

    getConnection(): ChannelModel | null {
        return this.connection;
    }

    getChannel(): Channel | null {
        return this.channel;
    }
}