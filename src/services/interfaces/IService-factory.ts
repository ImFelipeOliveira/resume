import {GeminiService} from "../ai-service";
import {RedisClientService} from "../redis-service";
import {BaileysService} from "../baileys-service";

export interface IServiceFactory {
    createGeminiService(): GeminiService;
    createRedisService(): RedisClientService
    createBaileysService(): BaileysService
}