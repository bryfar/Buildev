import { AIProvider } from "./provider";
import { GoogleGeminiProvider } from "./google-provider";
import { GroqProvider } from "./groq-provider";
import { SiteElement } from "../types";

// Mock Fallback
class MockProvider implements AIProvider {
    id = 'mock';
    async analyzeImage(): Promise<SiteElement[]> {
        // Return existing mock data from ai-service.ts (we will move it here or import it)
        return [];
    }
    async generateCode(): Promise<string> {
        return "// Mock code generation";
    }
}

export function getAIProvider(type?: 'vision' | 'code'): AIProvider {
    // Priority for Vision: Google -> Groq -> OpenAI/Mock
    if (type === 'vision') {
        if (process.env.GOOGLE_API_KEY) return new GoogleGeminiProvider();
        if (process.env.GROQ_API_KEY) return new GroqProvider();
    }

    // Priority for Code: Groq -> Google -> OpenAI/Mock
    if (type === 'code') {
        if (process.env.GROQ_API_KEY) return new GroqProvider();
        if (process.env.GOOGLE_API_KEY) return new GoogleGeminiProvider();
    }

    // Default or Fallback
    if (process.env.GOOGLE_API_KEY) return new GoogleGeminiProvider();

    return new MockProvider();
}
