import {CommandHandler} from "../command-handler";
import {MessageHandler} from "../message-handler";

export interface IHandlersFactory {
    createCommandHandler(): CommandHandler,
    createMessageHandler(): MessageHandler
}