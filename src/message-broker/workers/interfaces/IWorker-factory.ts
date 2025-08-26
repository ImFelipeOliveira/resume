import {SummaryWorker} from "../summary-worker";
import {ReplyWorker} from "../reply-worker";

export interface IWorkerFactory {
    createSummaryWorker(): SummaryWorker,

    createReplyWorker(): ReplyWorker,
}