import {
    GenerateContentResult,
    GenerativeModel,
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from "@google/generative-ai";
import {env} from "../config/env";
import {MessageData} from "./redis-service";

export class GeminiService {
    private readonly model: GenerativeModel;

    constructor() {
        const gemini = new GoogleGenerativeAI(env.gemini.apiKey!)
        this.model = gemini.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE},
                {category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE},
            ]
        })
    }

    private formatMessagesForAI(messages: MessageData[]): string {
        return messages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString(
                'pt-BR',
                {hour: '2-digit', minute: '2-digit'}
            );
            return `[${time}] ${msg.author}: ${msg.text}`;
        }).join('\n');
    }

    async summarizeMessages(messages: MessageData[]) {
        const formattedMessages = this.formatMessagesForAI(messages)
        const prompt = `
        Você é um assistente que resume conversas de um grupo de WhatsApp. 
        Abaixo estão as mensagens de um dia. Crie um resumo claro e conciso em português dos principais tópicos discutidos, usando bullet points.
        Conversa: ${formattedMessages} Resumo:`;

        try {
            const result: GenerateContentResult = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não foi possível gerar o resumo no momento.";
        }
    }

}