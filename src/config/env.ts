import "dotenv/config"

export const env = {
    redis: {
        url: process.env.REDIS_URL,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL,
        queues: {
            summary: process.env.RABBITMQ_SUMMARY_QUEUE
        }
    }
}