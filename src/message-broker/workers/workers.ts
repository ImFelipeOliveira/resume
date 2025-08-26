import {SummaryWorker} from "./summary-worker";
import {IWorkerFactory} from "./interfaces/IWorker-factory";
import {ReplyWorker} from "./reply-worker";

export class Workers {
    private summaryWorker: SummaryWorker;
    private replyWorker: ReplyWorker;

    constructor(private workerFactory: IWorkerFactory) {
        this.summaryWorker = this.workerFactory.createSummaryWorker()
        this.replyWorker = this.workerFactory.createReplyWorker()
    }

    async start() {
        await this.summaryWorker.processTask()
        await this.replyWorker.processTask()
    }

}