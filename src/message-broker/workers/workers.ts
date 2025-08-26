import {SummaryWorker} from "./summary-worker";
import {IWorkerFactory} from "./interfaces/IWorker-factory";

export class Workers {
    private summaryWorker: SummaryWorker;

    constructor(private workerFactory: IWorkerFactory) {
        this.summaryWorker = this.workerFactory.createSummaryWorker()
    }

    async start() {
        await this.summaryWorker.processTask()
    }

}