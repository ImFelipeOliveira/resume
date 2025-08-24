import "dotenv/config"

export const env = {
    redis: {
        url: process.env.REDIS_URL,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    }

}