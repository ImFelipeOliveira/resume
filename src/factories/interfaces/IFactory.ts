import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {IServiceFactory} from "../../services/interfaces/IService-factory";
import {IHandlersFactory} from "../../handlers/interfaces/IHandlers-factory";
import {IQueueFactory} from "../../message-broker/queue/interfaces/IQueue-factory";
import {IWorkerFactory} from "../../message-broker/workers/interfaces/IWorker-factory";

export interface IFactory {
    AdapterFactory: IAdapterFactory,
    ServiceFactory: IServiceFactory,
    HandlerFactory: IHandlersFactory
    QueueFactory: IQueueFactory,
    WorkerFactory: IWorkerFactory
}