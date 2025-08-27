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
        Você é um assistente que gera resumos de conversas de grupos de WhatsApp.
        A seguir estão as mensagens trocadas em um dia. Sua tarefa é:
        
        Produzir um resumo curto, claro e direto em português.
        
        Usar bullet points para organizar os principais tópicos discutidos.
        
        Evitar repetições e detalhes irrelevantes.
        
        Manter o resumo pequeno, destacando apenas os pontos centrais.
        
        Adicionar as urls como nas mensagems, completas, caso os considere importantes.
        
        Conversa:
        ${formattedMessages}
        
        Resumo:`;

        try {
            const result: GenerateContentResult = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não foi possível gerar o resumo no momento.";
        }
    }

    async customPrompt(prompt: string) {
        try {
            const result: GenerateContentResult = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            return "Desculpe, não foi possível gerar a mensagem no momento.";
        }
    }

}