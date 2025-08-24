import {
    createClient,
    RedisClientType,
} from "redis";
import {env} from "../config/env";

export interface MessageData {
    author: string;
    text: string;
    timestamp: number
}


export class RedisClient {
    private redisClient: RedisClientType;

    constructor() {
        this.redisClient = createClient({url: env.redis.url})
    }

    async connect() {
        await this.redisClient.connect()
    }

    private getRedisKey(groupId: string, date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, '0');
        return `messages:${groupId}:${year}-${month}-${day}`;
    }

    async storeMessage(groupId: string, messageData: MessageData) {
        const key = this.getRedisKey(groupId, new Date(messageData.timestamp));
        const messageString = JSON.stringify(messageData);
        await this.redisClient.lPush(key, messageString)
        await this.redisClient.expire(key, 86400)
    }

    async getMessagesByDate(groupId: string, date: Date): Promise<MessageData[]> {
        const key = this.getRedisKey(groupId, date);
        const messageStrings = await this.redisClient.lRange(key, 0, -1);

        if (!messageStrings || messageStrings.length === 0) {
            return [];
        }

        return messageStrings.map((msg) => JSON.parse(msg) as MessageData).reverse()
    }
}
