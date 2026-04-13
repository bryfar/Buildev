import OpenAI from "openai";
import { SYSTEM_PROMPT_VISION, getVisionUserPrompt } from "./prompts/vision";
import type { BuildevNode } from "@buildev/core";

export interface AIEngineConfig {
  apiKey: string;
  model?: string;
}

export class BuildevAIEngine {
  private client: OpenAI;
  private model: string;

  constructor(config: AIEngineConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || "gpt-4o";
  }

  /**
   * Convierte una imagen (vía URL o Base64) en un árbol de nodos de Buildev.
   * @param imageUrl URL de la imagen o string Base64 (data:image/jpeg;base64,...)
   * @param context Contexto opcional para guiar a la IA
   * @returns Array de BuildevNodes generados
   */
  async imageToNodes(imageUrl: string, context?: string): Promise<BuildevNode[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_VISION },
          {
            role: "user",
            content: [
              { type: "text", text: getVisionUserPrompt(context) },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("IA returned empty content");

      const data = JSON.parse(content);
      return data.nodes || [];
    } catch (err: any) {
      console.error("[Buildev AI Engine] Vision Error:", err.message);
      throw new Error(`AI processing failed: ${err.message}`);
    }
  }

  /**
   * Genera sugerencias de diseño basadas en una instrucción de chat.
   */
  async chatToStyle(nodes: BuildevNode[], instruction: string): Promise<Partial<BuildevNode>[]> {
     // Implementación futura para Sprint 3.5 (Chat editing)
     return [];
  }
}
