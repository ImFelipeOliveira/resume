import {IAdapterFactory} from "../../adapters/interfaces/IAdapter-factory";
import {SummaryWorker} from "./summary-worker";
import {IServiceFactory} from "../../services/interfaces/IService-factory";

export class Workers {
    private summaryWorker: SummaryWorker;

    constructor(private adapterFactory: IAdapterFactory, private serviceFactory: IServiceFactory) {
        this.summaryWorker = new SummaryWorker(this.adapterFactory, this.serviceFactory)
    }

    async start() {
        await this.summaryWorker.processTask()
    }

}