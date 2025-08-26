import {SummaryWorker} from "../summary-worker";

export interface IWorkerFactory {
    createSummaryWorker(): SummaryWorker
}