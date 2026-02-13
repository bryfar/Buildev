import { SiteElement } from '../types';

export interface AIProvider {
    /**
     * Unique identifier for the provider (e.g., 'google', 'groq', 'openai', 'mock')
     */
    id: string;

    /**
     * Analyzes a screenshot and returns a list of SiteElements.
     * @param imageBase64 The base64 encoded image string.
     * @param apiKey Optional API key override.
     */
    analyzeImage(imageBase64: string, apiKey?: string): Promise<SiteElement[]>;

    /**
     * Generates code or refinements based on a prompt and context.
     * @param prompt The user's instruction.
     * @param context The current code or element context.
     * @param apiKey Optional API key override.
     */
    generateCode(prompt: string, context: string, apiKey?: string): Promise<string>;
}

export type AIProviderType = 'google' | 'groq' | 'openrouter' | 'mock';
