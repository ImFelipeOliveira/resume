import {SummaryQueue} from "../summary-queue";
import {ReplyQueue} from "../reply-queue";

export interface IQueueFactory {
    createSummaryQueue(): SummaryQueue
    createReplyQueue(): ReplyQueue
}