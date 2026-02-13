import OpenAI from "openai";
import { AIProvider } from "./provider";
import { SiteElement } from "../types";

export class GroqProvider implements AIProvider {
    id = 'groq';
    private client: OpenAI;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GROQ_API_KEY;
        if (!key) throw new Error("Missing Groq API Key");

        this.client = new OpenAI({
            apiKey: key,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }

    async analyzeImage(imageBase64: string): Promise<SiteElement[]> {
        // Groq Vision is available via Llama 3.2 11B/90B
        // Check current model availability. For now, we might prefer Google for Vision.
        const response = await this.client.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "system",
                    content: "Analyze UI screenshot into SiteElement JSON."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Generate SiteElement JSON." },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || "[]");
    }

    async generateCode(prompt: string, context: string): Promise<string> {
        // Llama 3.3 70B is excellent for code and fast
        const response = await this.client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an expert Tailwind/React developer. Return only code."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nInstruction: ${prompt}`
                }
            ]
        });

        return response.choices[0].message.content || "";
    }
}
