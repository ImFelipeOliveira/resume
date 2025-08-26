import {RabbitMQ} from "../rabbitmq";

export interface IAdapterFactory {
    createRabbitMQAdapter(): Promise<RabbitMQ>
}