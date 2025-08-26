import {SummaryWorker} from "../summary-worker";
import {ReplyWorker} from "../reply-worker";
import {BaileysService} from "../../../services/baileys-service";

export interface IWorkerFactory {
    createSummaryWorker(): SummaryWorker,

    createReplyWorker(baileysService: BaileysService): ReplyWorker,
}