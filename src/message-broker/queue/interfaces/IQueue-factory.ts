import {SummaryQueue} from "../summary-queue";

export interface IQueueFactory {
    createSummaryQueue(): SummaryQueue
}